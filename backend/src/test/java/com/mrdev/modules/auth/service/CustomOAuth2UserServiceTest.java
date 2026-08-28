package com.mrdev.modules.auth.service;

import com.mrdev.modules.auth.model.Role;
import com.mrdev.modules.auth.model.User;
import com.mrdev.modules.auth.repository.UserRepository;
import com.mrdev.modules.auth.security.UserPrincipal;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomOAuth2UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private OAuth2User oAuth2User;

    @InjectMocks
    private CustomOAuth2UserService customOAuth2UserService;

    @Test
    @DisplayName("Should create new user when not existing")
    void testProcessOAuth2UserNewUser() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("sub", "google-sub-123");
        attributes.put("email", "newuser@example.com");
        attributes.put("name", "New User");
        attributes.put("picture", "https://avatar.url");

        when(oAuth2User.getAttributes()).thenReturn(attributes);
        when(userRepository.findByGoogleId("google-sub-123")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("newuser@example.com")).thenReturn(Optional.empty());

        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            saved.setId(100L);
            return saved;
        });

        UserPrincipal principal = customOAuth2UserService.processOAuth2User(null, oAuth2User);

        assertThat(principal).isNotNull();
        assertThat(principal.getId()).isEqualTo(100L);
        assertThat(principal.getEmail()).isEqualTo("newuser@example.com");
        assertThat(principal.getName()).isEqualTo("New User");
        assertThat(principal.getAvatarUrl()).isEqualTo("https://avatar.url");
        assertThat(principal.getRole()).isEqualTo(Role.STUDENT);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User captured = userCaptor.getValue();
        assertThat(captured.getEmail()).isEqualTo("newuser@example.com");
        assertThat(captured.getGoogleId()).isEqualTo("google-sub-123");
    }

    @Test
    @DisplayName("Should update existing user by googleId")
    void testProcessOAuth2UserExistingGoogleId() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("sub", "google-sub-123");
        attributes.put("email", "existing@example.com");
        attributes.put("name", "Updated Name");
        attributes.put("picture", "https://new-avatar.url");

        User existingUser = User.builder()
                .id(50L)
                .email("existing@example.com")
                .googleId("google-sub-123")
                .name("Old Name")
                .avatarUrl("https://old-avatar.url")
                .role(Role.STUDENT)
                .build();

        when(oAuth2User.getAttributes()).thenReturn(attributes);
        when(userRepository.findByGoogleId("google-sub-123")).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserPrincipal principal = customOAuth2UserService.processOAuth2User(null, oAuth2User);

        assertThat(principal).isNotNull();
        assertThat(principal.getId()).isEqualTo(50L);
        assertThat(principal.getName()).isEqualTo("Updated Name");
        assertThat(principal.getAvatarUrl()).isEqualTo("https://new-avatar.url");

        verify(userRepository).save(existingUser);
        assertThat(existingUser.getName()).isEqualTo("Updated Name");
        assertThat(existingUser.getAvatarUrl()).isEqualTo("https://new-avatar.url");
    }

    @Test
    @DisplayName("Should link googleId to existing user with matching email")
    void testProcessOAuth2UserExistingEmail() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("sub", "new-google-sub");
        attributes.put("email", "user@example.com");
        attributes.put("name", "User Name");
        attributes.put("picture", "https://pic.url");

        User existingUser = User.builder()
                .id(75L)
                .email("user@example.com")
                .googleId(null)
                .name("Old Name")
                .role(Role.ADMIN)
                .build();

        when(oAuth2User.getAttributes()).thenReturn(attributes);
        when(userRepository.findByGoogleId("new-google-sub")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserPrincipal principal = customOAuth2UserService.processOAuth2User(null, oAuth2User);

        assertThat(principal).isNotNull();
        assertThat(principal.getId()).isEqualTo(75L);
        assertThat(principal.getRole()).isEqualTo(Role.ADMIN);
        assertThat(existingUser.getGoogleId()).isEqualTo("new-google-sub");
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when email is missing")
    void testProcessOAuth2UserMissingEmail() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("sub", "sub-123");

        when(oAuth2User.getAttributes()).thenReturn(attributes);

        assertThatThrownBy(() -> customOAuth2UserService.processOAuth2User(null, oAuth2User))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Email not found");
    }
}
