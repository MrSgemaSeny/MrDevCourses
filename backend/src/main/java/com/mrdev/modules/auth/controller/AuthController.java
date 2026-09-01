package com.mrdev.modules.auth.controller;

import com.mrdev.common.dto.ApiResponse;
import com.mrdev.common.exception.ResourceNotFoundException;
import com.mrdev.common.ratelimit.IpResolver;
import com.mrdev.common.util.SecurityUtils;
import com.mrdev.modules.auth.dto.LoginRequest;
import com.mrdev.modules.auth.dto.RegisterRequest;
import com.mrdev.modules.auth.dto.UserDto;
import com.mrdev.modules.auth.model.User;
import com.mrdev.modules.auth.repository.UserRepository;
import com.mrdev.modules.auth.security.JwtAuthenticationFilter;
import com.mrdev.modules.auth.security.JwtCookieHelper;
import com.mrdev.modules.auth.service.AuthRateLimiter;
import com.mrdev.modules.auth.service.EmailAuthService;
import com.mrdev.modules.auth.service.JwtBlacklistService;
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
    private final JwtBlacklistService jwtBlacklistService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final IpResolver ipResolver;

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

        authRateLimiter.checkAndConsume(ipResolver.resolveClientIp(httpRequest));
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

        authRateLimiter.checkAndConsume(ipResolver.resolveClientIp(httpRequest));
        emailAuthService.login(request, httpResponse);

        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));
        return ResponseEntity.ok(ApiResponse.success(UserDto.fromEntity(user)));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            HttpServletRequest request,
            HttpServletResponse response) {
        String jwt = jwtAuthenticationFilter.extractJwtFromRequest(request);
        if (jwt != null) {
            jwtBlacklistService.revokeToken(jwt);
        }
        jwtCookieHelper.clearJwtCookie(response);
        return ResponseEntity.ok(ApiResponse.success("Successfully logged out", null));
    }
}
