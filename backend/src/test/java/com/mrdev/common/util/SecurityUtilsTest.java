package com.mrdev.common.util;

import com.mrdev.common.exception.ApiException;
import com.mrdev.modules.auth.model.Role;
import com.mrdev.modules.auth.model.User;
import com.mrdev.modules.auth.security.UserPrincipal;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class SecurityUtilsTest {

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Should extract current user details when authenticated")
    void testAuthenticatedContext() {
        User user = User.builder()
                .id(42L)
                .email("student@example.com")
                .name("Student Name")
                .role(Role.STUDENT)
                .build();
        UserPrincipal principal = UserPrincipal.create(user);
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);

        assertThat(SecurityUtils.isAuthenticated()).isTrue();
        assertThat(SecurityUtils.getCurrentUserId()).isEqualTo(42L);
        assertThat(SecurityUtils.getCurrentUserIdOptional()).contains(42L);
        assertThat(SecurityUtils.getCurrentUserRole()).isEqualTo(Role.STUDENT);
        assertThat(SecurityUtils.isAdmin()).isFalse();
    }

    @Test
    @DisplayName("Should identify ADMIN role correctly")
    void testAdminRole() {
        User user = User.builder()
                .id(1L)
                .email("admin@example.com")
                .name("Admin")
                .role(Role.ADMIN)
                .build();
        UserPrincipal principal = UserPrincipal.create(user);
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);

        assertThat(SecurityUtils.isAuthenticated()).isTrue();
        assertThat(SecurityUtils.getCurrentUserId()).isEqualTo(1L);
        assertThat(SecurityUtils.getCurrentUserRole()).isEqualTo(Role.ADMIN);
        assertThat(SecurityUtils.isAdmin()).isTrue();
    }

    @Test
    @DisplayName("Should throw ApiException when unauthenticated")
    void testUnauthenticatedContext() {
        SecurityContextHolder.clearContext();

        assertThat(SecurityUtils.isAuthenticated()).isFalse();
        assertThat(SecurityUtils.getCurrentUserIdOptional()).isEmpty();
        assertThat(SecurityUtils.isAdmin()).isFalse();

        assertThatThrownBy(SecurityUtils::getCurrentUserId)
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("User is not authenticated");

        assertThatThrownBy(SecurityUtils::getCurrentUserRole)
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("User is not authenticated");
    }
}
