package com.mrdevcourses.modules.auth.controller;

import com.mrdevcourses.common.dto.ApiResponse;
import com.mrdevcourses.common.exception.ResourceNotFoundException;
import com.mrdevcourses.common.util.SecurityUtils;
import com.mrdevcourses.modules.auth.dto.LoginRequest;
import com.mrdevcourses.modules.auth.dto.RegisterRequest;
import com.mrdevcourses.modules.auth.dto.UserDto;
import com.mrdevcourses.modules.auth.model.User;
import com.mrdevcourses.modules.auth.repository.UserRepository;
import com.mrdevcourses.modules.auth.security.JwtCookieHelper;
import com.mrdevcourses.modules.auth.service.AuthRateLimiter;
import com.mrdevcourses.modules.auth.service.EmailAuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final JwtCookieHelper jwtCookieHelper;
    private final EmailAuthService emailAuthService;
    private final AuthRateLimiter authRateLimiter;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getMe() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));
        return ResponseEntity.ok(ApiResponse.success(UserDto.fromEntity(user)));
    }

    /**
     * Email/password registration.
     * Sets JWT cookie in response. Frontend calls /me on next request to get user data.
     * We return user data directly here to save the extra round-trip.
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserDto>> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        authRateLimiter.checkAndConsume(getClientIp(httpRequest));
        emailAuthService.register(request, httpResponse);

        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));
        return ResponseEntity.ok(ApiResponse.success("Регистрация прошла успешно", UserDto.fromEntity(user)));
    }

    /**
     * Email/password login.
     * Sets JWT cookie in response.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserDto>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        authRateLimiter.checkAndConsume(getClientIp(httpRequest));
        emailAuthService.login(request, httpResponse);

        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));
        return ResponseEntity.ok(ApiResponse.success(UserDto.fromEntity(user)));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletResponse response) {
        jwtCookieHelper.clearJwtCookie(response);
        return ResponseEntity.ok(ApiResponse.success("Successfully logged out", null));
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
