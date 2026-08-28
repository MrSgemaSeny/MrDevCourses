package com.mrdev.common.ratelimit;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mrdev.common.dto.ErrorResponse;
import com.mrdev.common.util.SecurityUtils;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitingFilter extends OncePerRequestFilter {

    public static final String HEADER_RETRY_AFTER = "Retry-After";
    public static final String HEADER_RATE_LIMIT_REMAINING = "X-RateLimit-Remaining";

    private final RateLimiterService rateLimiterService;
    private final IpResolver ipResolver;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // Skip CORS pre-flight OPTIONS requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String path = extractNormalizedPath(request);

        // Determine RateLimitTier for the requested path
        Optional<RateLimitTier> tierOpt = resolveTierForPath(path);
        if (tierOpt.isEmpty()) {
            filterChain.doFilter(request, response);
            return;
        }

        RateLimitTier tier = tierOpt.get();
        String rateLimitKey = resolveKey(request, tier);

        ConsumptionProbe probe = rateLimiterService.tryConsume(rateLimitKey, tier);

        if (probe.isConsumed()) {
            response.setHeader(HEADER_RATE_LIMIT_REMAINING, String.valueOf(probe.getRemainingTokens()));
            filterChain.doFilter(request, response);
        } else {
            long waitForRefillNanos = probe.getNanosToWaitForRefill();
            long retryAfterSeconds = Math.max(1, (long) Math.ceil(waitForRefillNanos / 1_000_000_000.0));

            log.warn("Rate limit exceeded for tier: {}, key: {}, path: {}, retryAfter: {}s",
                    tier, rateLimitKey, path, retryAfterSeconds);

            handleRateLimitExceeded(request, response, retryAfterSeconds);
        }
    }

    private String extractNormalizedPath(HttpServletRequest request) {
        String uri = request.getRequestURI();
        String contextPath = request.getContextPath();
        if (contextPath != null && !contextPath.isEmpty() && uri.startsWith(contextPath)) {
            uri = uri.substring(contextPath.length());
        }
        return uri;
    }

    private Optional<RateLimitTier> resolveTierForPath(String path) {
        if (path == null) {
            return Optional.empty();
        }

        // Auth Tier: /v1/auth/** or /api/v1/auth/**
        if (path.startsWith("/v1/auth") || path.startsWith("/api/v1/auth")) {
            return Optional.of(RateLimitTier.AUTH);
        }

        // AI Tier: /v1/ai/** or /api/v1/ai/**
        if (path.startsWith("/v1/ai") || path.startsWith("/api/v1/ai")) {
            return Optional.of(RateLimitTier.AI);
        }

        // General API Tier: /v1/** or /api/v1/**
        if (path.startsWith("/v1/") || path.startsWith("/api/v1/") || "/v1".equals(path) || "/api/v1".equals(path)) {
            return Optional.of(RateLimitTier.GENERAL);
        }

        // Other non-API paths (actuator, oauth2, error, etc.) are bypassed
        return Optional.empty();
    }

    private String resolveKey(HttpServletRequest request, RateLimitTier tier) {
        String clientIp = ipResolver.resolveClientIp(request);
        Optional<Long> userIdOpt = SecurityUtils.getCurrentUserIdOptional();

        return switch (tier) {
            case AUTH -> "ip:" + clientIp;
            case AI -> userIdOpt.map(id -> "user:" + id).orElse("ip:" + clientIp);
            case GENERAL -> userIdOpt.map(id -> "user:" + id).orElse("ip:" + clientIp);
        };
    }

    private void handleRateLimitExceeded(HttpServletRequest request,
                                         HttpServletResponse response,
                                         long retryAfterSeconds) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.setHeader(HEADER_RETRY_AFTER, String.valueOf(retryAfterSeconds));
        response.setHeader(HEADER_RATE_LIMIT_REMAINING, "0");

        ErrorResponse errorResponse = ErrorResponse.builder()
                .status(HttpStatus.TOO_MANY_REQUESTS.value())
                .error(HttpStatus.TOO_MANY_REQUESTS.getReasonPhrase())
                .message("Слишком много запросов. Пожалуйста, повторите позже.")
                .path(request.getRequestURI())
                .timestamp(Instant.now())
                .build();

        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
        response.getWriter().flush();
    }
}
