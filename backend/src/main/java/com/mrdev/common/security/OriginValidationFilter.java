package com.mrdev.common.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.net.URI;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Component
public class OriginValidationFilter extends OncePerRequestFilter {

    private final Set<String> allowedOriginsSet;

    public OriginValidationFilter(@Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173}") String allowedOrigins) {
        this.allowedOriginsSet = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .map(this::normalizeOrigin)
                .collect(Collectors.toSet());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String method = request.getMethod();

        // Safe HTTP methods do not change state
        if (HttpMethod.GET.matches(method) || HttpMethod.HEAD.matches(method) || HttpMethod.OPTIONS.matches(method)) {
            filterChain.doFilter(request, response);
            return;
        }

        String origin = request.getHeader("Origin");
        if (!StringUtils.hasText(origin)) {
            String referer = request.getHeader("Referer");
            if (StringUtils.hasText(referer)) {
                origin = extractOriginFromReferer(referer);
            }
        }

        if (StringUtils.hasText(origin)) {
            String normalizedOrigin = normalizeOrigin(origin);
            if (!allowedOriginsSet.contains(normalizedOrigin) && !isLocalhostOrDev(normalizedOrigin)) {
                log.warn("Rejected state-changing request from unauthorized Origin/Referer: {}", origin);
                writeForbiddenResponse(response, "Cross-Origin request blocked by Origin validation");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private String extractOriginFromReferer(String referer) {
        try {
            URI uri = URI.create(referer);
            String scheme = uri.getScheme() != null ? uri.getScheme().toLowerCase() : "http";
            String host = uri.getHost() != null ? uri.getHost().toLowerCase() : "";
            int port = uri.getPort();
            if (port == -1 || (scheme.equals("http") && port == 80) || (scheme.equals("https") && port == 443)) {
                return scheme + "://" + host;
            }
            return scheme + "://" + host + ":" + port;
        } catch (Exception e) {
            return null;
        }
    }

    private String normalizeOrigin(String origin) {
        if (origin == null) return "";
        try {
            URI uri = URI.create(origin);
            String scheme = uri.getScheme() != null ? uri.getScheme().toLowerCase() : "http";
            String host = uri.getHost() != null ? uri.getHost().toLowerCase() : "";
            int port = uri.getPort();
            if (port == -1 || (scheme.equals("http") && port == 80) || (scheme.equals("https") && port == 443)) {
                return scheme + "://" + host;
            }
            return scheme + "://" + host + ":" + port;
        } catch (Exception e) {
            return origin.trim().toLowerCase();
        }
    }

    private boolean isLocalhostOrDev(String origin) {
        return origin.contains("localhost") || origin.contains("127.0.0.1");
    }

    private void writeForbiddenResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("{\"success\":false,\"error\":\"" + message + "\"}");
    }
}
