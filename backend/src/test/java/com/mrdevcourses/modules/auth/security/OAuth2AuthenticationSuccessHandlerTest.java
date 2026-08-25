package com.mrdevcourses.modules.auth.security;

import com.mrdevcourses.modules.auth.model.Role;
import com.mrdevcourses.modules.auth.service.JwtTokenProvider;
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
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OAuth2AuthenticationSuccessHandlerTest {

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private OAuth2AuthenticationSuccessHandler successHandler;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(successHandler, "cookieName", "mrdevcourses_token");
        ReflectionTestUtils.setField(successHandler, "cookieSecure", false);
        ReflectionTestUtils.setField(successHandler, "cookieSameSite", "Lax");
        ReflectionTestUtils.setField(successHandler, "expirationMs", 86400000L);
        ReflectionTestUtils.setField(successHandler, "frontendUrl", "http://localhost:5173");
    }

    @Test
    @DisplayName("Should set httpOnly cookie and redirect to frontend callback on success")
    void testOnAuthenticationSuccess() throws IOException {
        UserPrincipal principal = UserPrincipal.builder()
                .id(1L)
                .email("student@example.com")
                .name("Student")
                .role(Role.STUDENT)
                .build();

        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(jwtTokenProvider.generateToken(1L, "student@example.com", Role.STUDENT)).thenReturn("mocked-jwt-token");

        successHandler.onAuthenticationSuccess(request, response, auth);

        String setCookieHeader = response.getHeader("Set-Cookie");
        assertThat(setCookieHeader).isNotNull();
        assertThat(setCookieHeader).contains("mrdevcourses_token=mocked-jwt-token");
        assertThat(setCookieHeader).contains("HttpOnly");
        assertThat(setCookieHeader).contains("Path=/");
        assertThat(setCookieHeader).contains("Max-Age=86400");
        assertThat(setCookieHeader).contains("SameSite=Lax");

        assertThat(response.getRedirectedUrl()).isEqualTo("http://localhost:5173/auth/callback");
    }
}
