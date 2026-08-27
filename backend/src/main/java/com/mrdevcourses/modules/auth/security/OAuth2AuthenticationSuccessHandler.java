package com.mrdevcourses.modules.auth.security;

import com.mrdevcourses.modules.auth.service.CustomOAuth2UserService;
import com.mrdevcourses.modules.auth.service.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider tokenProvider;
    private final JwtCookieHelper jwtCookieHelper;
    private final CustomOAuth2UserService customOAuth2UserService;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        UserPrincipal principal;
        Object rawPrincipal = authentication.getPrincipal();

        if (rawPrincipal instanceof UserPrincipal userPrincipal) {
            principal = userPrincipal;
        } else if (rawPrincipal instanceof OAuth2User oAuth2User) {
            principal = customOAuth2UserService.processOAuth2User(null, oAuth2User);
        } else {
            log.error("Unsupported authentication principal type: {}", rawPrincipal != null ? rawPrincipal.getClass() : "null");
            throw new IllegalStateException("Unsupported authentication principal type: " + (rawPrincipal != null ? rawPrincipal.getClass().getName() : "null"));
        }

        String token = tokenProvider.generateToken(principal.getId(), principal.getEmail(), principal.getRole());
        jwtCookieHelper.addJwtCookie(response, token);
        String targetUrl = frontendUrl + "/auth/callback";
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
