package com.mrdev.modules.auth.service;

import com.mrdev.modules.auth.model.Role;
import com.mrdev.modules.auth.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JwtTokenProviderTest {

    private static final String SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private static final long EXPIRATION_MS = 86400000; // 24 hours

    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(SECRET, EXPIRATION_MS);
    }

    @Test
    @DisplayName("Should generate valid token with correct claims")
    void testGenerateAndValidateToken() {
        User user = User.builder()
                .id(123L)
                .email("test@example.com")
                .role(Role.STUDENT)
                .build();

        String token = jwtTokenProvider.generateToken(user);

        assertThat(token).isNotBlank();
        assertThat(jwtTokenProvider.validateToken(token)).isTrue();
        assertThat(jwtTokenProvider.getUserIdFromToken(token)).isEqualTo(123L);
        assertThat(jwtTokenProvider.getEmailFromToken(token)).isEqualTo("test@example.com");
        assertThat(jwtTokenProvider.getRoleFromToken(token)).isEqualTo(Role.STUDENT);
    }

    @Test
    @DisplayName("Should generate token for ADMIN role")
    void testGenerateTokenAdminRole() {
        String token = jwtTokenProvider.generateToken(999L, "admin@example.com", Role.ADMIN);

        assertThat(jwtTokenProvider.validateToken(token)).isTrue();
        assertThat(jwtTokenProvider.getUserIdFromToken(token)).isEqualTo(999L);
        assertThat(jwtTokenProvider.getEmailFromToken(token)).isEqualTo("admin@example.com");
        assertThat(jwtTokenProvider.getRoleFromToken(token)).isEqualTo(Role.ADMIN);
    }

    @Test
    @DisplayName("Should reject tampered token")
    void testValidateTamperedToken() {
        String token = jwtTokenProvider.generateToken(1L, "user@example.com", Role.STUDENT);
        String tamperedToken = token + "tampered";

        assertThat(jwtTokenProvider.validateToken(tamperedToken)).isFalse();
    }

    @Test
    @DisplayName("Should reject expired token")
    void testValidateExpiredToken() {
        JwtTokenProvider shortLivedProvider = new JwtTokenProvider(SECRET, -1000); // already expired
        String token = shortLivedProvider.generateToken(1L, "user@example.com", Role.STUDENT);

        assertThat(jwtTokenProvider.validateToken(token)).isFalse();
    }

    @Test
    @DisplayName("Should generate valid token with rememberMe flag and extended expiry")
    void testGenerateRememberMeToken() {
        long normalExp = 604800000L;
        long rememberMeExp = 2592000000L;
        JwtTokenProvider provider = new JwtTokenProvider(SECRET, normalExp, rememberMeExp);

        User user = User.builder()
                .id(456L)
                .email("remember@example.com")
                .role(Role.STUDENT)
                .build();

        String token = provider.generateToken(user, true);

        assertThat(token).isNotBlank();
        assertThat(provider.validateToken(token)).isTrue();
        assertThat(provider.getUserIdFromToken(token)).isEqualTo(456L);
        assertThat(provider.getEmailFromToken(token)).isEqualTo("remember@example.com");
    }

    @Test
    @DisplayName("Should reject null or malformed tokens")
    void testValidateMalformedToken() {
        assertThat(jwtTokenProvider.validateToken(null)).isFalse();
        assertThat(jwtTokenProvider.validateToken("")).isFalse();
        assertThat(jwtTokenProvider.validateToken("invalid.jwt.token")).isFalse();
    }
}
