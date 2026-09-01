package com.mrdev.modules.auth.security;

import com.mrdev.modules.auth.model.Role;
import com.mrdev.modules.auth.model.User;
import com.mrdev.modules.auth.repository.UserRepository;
import com.mrdev.modules.auth.service.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OAuth2AuthenticationSuccessHandlerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private JwtCookieHelper jwtCookieHelper;

    @InjectMocks
    private OAuth2AuthenticationSuccessHandler successHandler;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(successHandler, "frontendUrl", "http://localhost:5173");
    }

    @Test
    @DisplayName("Should set httpOnly cookie and redirect to frontend callback on success")
    void testOnAuthenticationSuccess() throws IOException {
        Map<String, Object> attributes = Map.of(
                "sub", "google-sub-123",
                "email", "student@example.com",
                "name", "Student Name",
                "picture", "https://avatar.url"
        );

        OAuth2User oAuth2User = new DefaultOAuth2User(
                Collections.emptyList(),
                attributes,
                "email"
        );

        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(oAuth2User, null, oAuth2User.getAuthorities());

        User testUser = User.builder()
                .id(1L)
                .email("student@example.com")
                .name("Student Name")
                .role(Role.STUDENT)
                .build();

        when(userRepository.findByGoogleId("google-sub-123")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("student@example.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtTokenProvider.generateToken(1L, "student@example.com", Role.STUDENT, true))
                .thenReturn("mocked-jwt-token");

        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        successHandler.onAuthenticationSuccess(request, response, auth);

        verify(jwtCookieHelper).addJwtCookie(any(), eq("mocked-jwt-token"), eq(true));
        assertThat(response.getRedirectedUrl()).isEqualTo("http://localhost:5173/auth/callback");
    }
}
