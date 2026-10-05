package com.mrdev.modules.auth.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.mrdev.common.exception.ApiException;
import com.mrdev.modules.audit.service.AuditService;
import com.mrdev.modules.auth.dto.UserDto;
import com.mrdev.modules.auth.model.Role;
import com.mrdev.modules.auth.model.User;
import com.mrdev.modules.auth.repository.UserRepository;
import com.mrdev.modules.auth.security.JwtCookieHelper;
import com.mrdev.modules.automation.service.EmailNotificationService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.Instant;
import java.util.Collections;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleAuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;
    private final JwtCookieHelper jwtCookieHelper;
    private final EmailNotificationService emailNotificationService;
    private final AuditService auditService;

    @Value("${spring.security.oauth2.client.registration.google.client-id:${GOOGLE_CLIENT_ID:}}")
    private String googleClientId;

    public GoogleIdToken.Payload verifyCredential(String credential) {
        if (credential == null || credential.isBlank()) {
            throw new ApiException("Google credential token is required", HttpStatus.BAD_REQUEST);
        }

        try {
            GoogleIdTokenVerifier.Builder verifierBuilder = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    new GsonFactory()
            );

            if (googleClientId != null && !googleClientId.isBlank() && !googleClientId.contains("placeholder")) {
                verifierBuilder.setAudience(Collections.singletonList(googleClientId));
            }

            GoogleIdTokenVerifier verifier = verifierBuilder.build();
            GoogleIdToken idToken = verifier.verify(credential);

            if (idToken == null) {
                log.warn("[GoogleAuth] Invalid Google ID token received");
                throw new ApiException("Недействительный токен Google", HttpStatus.UNAUTHORIZED);
            }

            return idToken.getPayload();
        } catch (IOException | GeneralSecurityException e) {
            log.error("[GoogleAuth] Failed to verify Google ID token: {}", e.getMessage(), e);
            throw new ApiException("Ошибка проверки токена Google: " + e.getMessage(), HttpStatus.UNAUTHORIZED);
        }
    }

    @Transactional
    public UserDto loginWithGoogle(String credential, HttpServletResponse response) {
        GoogleIdToken.Payload payload = verifyCredential(credential);

        String email = payload.getEmail();
        if (email == null || email.isBlank()) {
            throw new ApiException("Email отсутствует в профиле Google", HttpStatus.BAD_REQUEST);
        }
        email = email.trim().toLowerCase();

        String googleId = payload.getSubject();
        String name = (String) payload.get("name");
        String picture = (String) payload.get("picture");

        boolean isNew = userRepository.findByGoogleId(googleId).isEmpty() && userRepository.findByEmail(email).isEmpty();

        final String finalEmail = email;
        final String finalName = name;
        final String finalPicture = picture;

        User user = userRepository.findByGoogleId(googleId)
                .or(() -> userRepository.findByEmail(finalEmail))
                .map(existing -> {
                    existing.setGoogleId(googleId);
                    if (finalName != null && (existing.getName() == null || existing.getName().isBlank())) {
                        existing.setName(finalName);
                    }
                    if (finalPicture != null && (existing.getAvatarUrl() == null || existing.getAvatarUrl().isBlank())) {
                        existing.setAvatarUrl(finalPicture);
                    }
                    return userRepository.save(existing);
                })
                .orElseGet(() -> userRepository.save(User.builder()
                        .email(finalEmail)
                        .googleId(googleId)
                        .name(finalName != null ? finalName : finalEmail.split("@")[0])
                        .avatarUrl(finalPicture)
                        .role(Role.STUDENT)
                        .createdAt(Instant.now())
                        .build()));

        if (isNew) {
            emailNotificationService.sendWelcomeEmail(user);
            log.info("[GoogleAuth] Registered new user via Google: id={}, email={}", user.getId(), user.getEmail());
            auditService.logAction(user.getId(), "AUTH_REGISTER_GOOGLE", "User", user.getId(),
                    "Registered via Google ID Token: " + user.getEmail(), null);
        } else {
            log.info("[GoogleAuth] Logged in existing user via Google: id={}, email={}", user.getId(), user.getEmail());
            auditService.logAction(user.getId(), "AUTH_LOGIN_GOOGLE", "User", user.getId(),
                    "Logged in via Google ID Token: " + user.getEmail(), null);
        }

        String token = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole(), true);
        jwtCookieHelper.addJwtCookie(response, token, true);

        return UserDto.fromEntity(user);
    }
}
