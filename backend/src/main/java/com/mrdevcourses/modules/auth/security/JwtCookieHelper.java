package com.mrdevcourses.modules.auth.security;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

/**
 * Centralizes JWT cookie creation so that OAuth2SuccessHandler and
 * AuthController (email/password flow) use identical cookie settings.
 */
@Component
@RequiredArgsConstructor
public class JwtCookieHelper {

    @Value("${app.jwt.cookie-name:mrdevcourses_token}")
    private String cookieName;

    @Value("${app.jwt.cookie-secure:false}")
    private boolean cookieSecure;

    @Value("${app.jwt.cookie-same-site:Lax}")
    private String cookieSameSite;

    @Value("${app.jwt.expiration-ms:86400000}")
    private long expirationMs;

    public void addJwtCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from(cookieName, token)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(expirationMs / 1000)
                .sameSite(cookieSameSite)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public void clearJwtCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(cookieName, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(0)
                .sameSite(cookieSameSite)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
