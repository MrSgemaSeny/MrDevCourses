package com.mrdevcourses.modules.auth.service;

import com.mrdevcourses.common.exception.ApiException;
import com.mrdevcourses.modules.audit.service.AuditService;
import com.mrdevcourses.modules.auth.dto.LoginRequest;
import com.mrdevcourses.modules.auth.dto.RegisterRequest;
import com.mrdevcourses.modules.auth.model.Role;
import com.mrdevcourses.modules.auth.model.User;
import com.mrdevcourses.modules.auth.repository.UserRepository;
import com.mrdevcourses.modules.auth.security.JwtCookieHelper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailAuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final JwtCookieHelper jwtCookieHelper;
    private final AuditService auditService;

    // BCrypt is stateless — safe as a field
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Transactional
    public void register(RegisterRequest request, HttpServletResponse response) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new ApiException("Email уже зарегистрирован", HttpStatus.CONFLICT);
        }

        User user = User.builder()
                .email(email)
                .name(request.getName().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.STUDENT)
                .build();

        userRepository.save(user);
        log.info("[EmailAuth] Registered new user: {}", email);
        auditService.logAction(user.getId(), "AUTH_REGISTER", "User", user.getId(),
                "Registered via email: " + email, null);

        String token = jwtTokenProvider.generateToken(user);
        jwtCookieHelper.addJwtCookie(response, token);
    }

    @Transactional(readOnly = true)
    public void login(LoginRequest request, HttpServletResponse response) {
        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElse(null);

        // Constant-time response to prevent user enumeration
        if (user == null || user.getPasswordHash() == null
                || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            log.warn("[EmailAuth] Failed login attempt for: {}", email);
            auditService.logAction(null, "AUTH_LOGIN_FAILURE", "User", null,
                    "Failed email login for: " + email, null);
            throw new ApiException("Неверный email или пароль", HttpStatus.UNAUTHORIZED);
        }

        log.info("[EmailAuth] Login success: {}", email);
        auditService.logAction(user.getId(), "AUTH_LOGIN", "User", user.getId(),
                "Login via email: " + email, null);

        String token = jwtTokenProvider.generateToken(user);
        jwtCookieHelper.addJwtCookie(response, token);
    }
}
