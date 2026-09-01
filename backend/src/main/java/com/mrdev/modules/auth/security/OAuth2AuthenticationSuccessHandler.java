package com.mrdev.modules.auth.security;

import com.mrdev.modules.auth.model.Role;
import com.mrdev.modules.auth.model.User;
import com.mrdev.modules.auth.repository.UserRepository;
import com.mrdev.modules.auth.service.JwtTokenProvider;
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
import java.time.Instant;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;
    private final JwtCookieHelper jwtCookieHelper;
    private final com.mrdev.modules.automation.service.EmailNotificationService emailNotificationService;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email = (String) attributes.get("email");
        String googleId = (String) attributes.get("sub");
        String name = (String) attributes.get("name");
        String picture = (String) attributes.get("picture");

        if (email == null || email.isBlank()) {
            log.error("OAuth2 user has no email in attributes: {}", attributes);
            getRedirectStrategy().sendRedirect(request, response, frontendUrl + "/login?error=no_email");
            return;
        }

        boolean isNew = userRepository.findByGoogleId(googleId).isEmpty() && userRepository.findByEmail(email).isEmpty();

        User user = userRepository.findByGoogleId(googleId)
                .or(() -> userRepository.findByEmail(email))
                .map(existing -> {
                    existing.setGoogleId(googleId);
                    if (name != null) existing.setName(name);
                    if (picture != null) existing.setAvatarUrl(picture);
                    return userRepository.save(existing);
                })
                .orElseGet(() -> userRepository.save(User.builder()
                        .email(email)
                        .googleId(googleId)
                        .name(name != null ? name : email.split("@")[0])
                        .avatarUrl(picture)
                        .role(Role.STUDENT)
                        .createdAt(Instant.now())
                        .build()));

        if (isNew) {
            emailNotificationService.sendWelcomeEmail(user);
        }

        String token = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole(), true);
        jwtCookieHelper.addJwtCookie(response, token, true);

        log.info("OAuth2 login successful for user: id={}, email={}, isNew={}", user.getId(), user.getEmail(), isNew);
        getRedirectStrategy().sendRedirect(request, response, frontendUrl + "/auth/callback");
    }
}
