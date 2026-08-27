package com.mrdevcourses.common.ratelimit;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.mrdevcourses.common.dto.ErrorResponse;
import com.mrdevcourses.modules.auth.model.Role;
import com.mrdevcourses.modules.auth.security.UserPrincipal;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;
import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;

class RateLimitingFilterTest {

    private RateLimiterService rateLimiterService;
    private IpResolver ipResolver;
    private ObjectMapper objectMapper;
    private RateLimitingFilter rateLimitingFilter;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        rateLimiterService = new RateLimiterService();
        ipResolver = new IpResolver();
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        rateLimitingFilter = new RateLimitingFilter(rateLimiterService, ipResolver, objectMapper);
    }

    @Test
    @DisplayName("Should allow requests within limit and add X-RateLimit-Remaining header")
    void testAllowedRequestAddsRemainingHeader() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/v1/auth/me");
        request.setRemoteAddr("198.51.100.10");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain filterChain = new MockFilterChain();

        rateLimitingFilter.doFilter(request, response, filterChain);

        assertThat(response.getStatus()).isEqualTo(HttpStatus.OK.value());
        assertThat(response.getHeader(RateLimitingFilter.HEADER_RATE_LIMIT_REMAINING)).isEqualTo("9");
    }

    @Test
    @DisplayName("Should return 429 Too Many Requests when Auth tier limit is exceeded")
    void testAuthTierThrottlingReturns429() throws ServletException, IOException {
        String clientIp = "198.51.100.20";

        // Exhaust 10 tokens
        for (int i = 0; i < 10; i++) {
            MockHttpServletRequest req = new MockHttpServletRequest("POST", "/v1/auth/login");
            req.setRemoteAddr(clientIp);
            MockHttpServletResponse res = new MockHttpServletResponse();
            rateLimitingFilter.doFilter(req, res, new MockFilterChain());
            assertThat(res.getStatus()).isEqualTo(HttpStatus.OK.value());
        }

        // 11th request must be throttled
        MockHttpServletRequest req11 = new MockHttpServletRequest("POST", "/v1/auth/login");
        req11.setRemoteAddr(clientIp);
        MockHttpServletResponse res11 = new MockHttpServletResponse();
        rateLimitingFilter.doFilter(req11, res11, new MockFilterChain());

        assertThat(res11.getStatus()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS.value());
        assertThat(res11.getHeader(RateLimitingFilter.HEADER_RETRY_AFTER)).isNotNull();
        assertThat(res11.getHeader(RateLimitingFilter.HEADER_RATE_LIMIT_REMAINING)).isEqualTo("0");

        ErrorResponse error = objectMapper.readValue(res11.getContentAsString(), ErrorResponse.class);
        assertThat(error.getStatus()).isEqualTo(429);
        assertThat(error.getError()).isEqualTo("Too Many Requests");
        assertThat(error.getPath()).isEqualTo("/v1/auth/login");
    }

    @Test
    @DisplayName("Should rate limit AI tier per authenticated user")
    void testAiTierRateLimitPerUser() throws ServletException, IOException {
        UserPrincipal principal = UserPrincipal.builder()
                .id(99L)
                .email("student@test.com")
                .role(Role.STUDENT)
                .build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, Collections.emptyList())
        );

        // Exhaust 5 tokens for user 99
        for (int i = 0; i < 5; i++) {
            MockHttpServletRequest req = new MockHttpServletRequest("POST", "/v1/ai/tutor/chat");
            MockHttpServletResponse res = new MockHttpServletResponse();
            rateLimitingFilter.doFilter(req, res, new MockFilterChain());
            assertThat(res.getStatus()).isEqualTo(HttpStatus.OK.value());
        }

        // 6th request
        MockHttpServletRequest req6 = new MockHttpServletRequest("POST", "/v1/ai/tutor/chat");
        MockHttpServletResponse res6 = new MockHttpServletResponse();
        rateLimitingFilter.doFilter(req6, res6, new MockFilterChain());

        assertThat(res6.getStatus()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS.value());
        assertThat(res6.getHeader(RateLimitingFilter.HEADER_RATE_LIMIT_REMAINING)).isEqualTo("0");
    }

    @Test
    @DisplayName("Should bypass OPTIONS pre-flight requests")
    void testOptionsBypass() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest("OPTIONS", "/v1/auth/login");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain filterChain = new MockFilterChain();

        rateLimitingFilter.doFilter(request, response, filterChain);

        assertThat(response.getStatus()).isEqualTo(HttpStatus.OK.value());
        assertThat(response.getHeader(RateLimitingFilter.HEADER_RATE_LIMIT_REMAINING)).isNull();
    }

    @Test
    @DisplayName("Should bypass non-API paths such as actuator health")
    void testActuatorBypass() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/actuator/health");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain filterChain = new MockFilterChain();

        rateLimitingFilter.doFilter(request, response, filterChain);

        assertThat(response.getStatus()).isEqualTo(HttpStatus.OK.value());
        assertThat(response.getHeader(RateLimitingFilter.HEADER_RATE_LIMIT_REMAINING)).isNull();
    }
}
