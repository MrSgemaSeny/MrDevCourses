package com.mrdev.modules.auth.service;

import com.mrdev.modules.auth.model.Role;
import com.mrdev.modules.auth.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JwtBlacklistServiceTest {

    private JwtTokenProvider jwtTokenProvider;
    private JwtBlacklistService jwtBlacklistService;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(
                "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970",
                604800000L
        );
        jwtBlacklistService = new JwtBlacklistService(jwtTokenProvider);
    }

    @Test
    @DisplayName("Should revoke token and report it as revoked")
    void testRevokeToken() {
        User user = User.builder()
                .id(1L)
                .email("student@test.com")
                .role(Role.STUDENT)
                .build();

        String token = jwtTokenProvider.generateToken(user);

        assertThat(jwtBlacklistService.isTokenRevoked(token)).isFalse();

        jwtBlacklistService.revokeToken(token);

        assertThat(jwtBlacklistService.isTokenRevoked(token)).isTrue();
    }

    @Test
    @DisplayName("Should safely handle null or blank tokens")
    void testNullOrBlankToken() {
        assertThat(jwtBlacklistService.isTokenRevoked(null)).isFalse();
        assertThat(jwtBlacklistService.isTokenRevoked("")).isFalse();
        jwtBlacklistService.revokeToken(null);
        jwtBlacklistService.revokeToken("");
    }
}