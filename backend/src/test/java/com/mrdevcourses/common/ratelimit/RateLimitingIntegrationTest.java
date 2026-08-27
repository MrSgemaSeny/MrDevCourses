package com.mrdevcourses.common.ratelimit;

import com.mrdevcourses.modules.audit.repository.AuditLogRepository;
import com.mrdevcourses.modules.auth.model.Role;
import com.mrdevcourses.modules.auth.model.User;
import com.mrdevcourses.modules.auth.repository.UserRepository;
import com.mrdevcourses.modules.auth.service.JwtTokenProvider;
import com.mrdevcourses.modules.course.model.Course;
import com.mrdevcourses.modules.course.repository.CourseRepository;
import com.mrdevcourses.modules.course.repository.EnrollmentRepository;
import com.mrdevcourses.modules.lesson.repository.LessonProgressRepository;
import com.mrdevcourses.modules.lesson.repository.LessonRepository;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RateLimitingIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private RateLimiterService rateLimiterService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private LessonProgressRepository lessonProgressRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User testUser;
    private String userToken;

    @BeforeEach
    void setUp() {
        rateLimiterService.reset();
        auditLogRepository.deleteAll();
        lessonProgressRepository.deleteAll();
        lessonRepository.deleteAll();
        enrollmentRepository.deleteAll();
        courseRepository.deleteAll();
        userRepository.deleteAll();

        testUser = User.builder()
                .email("ratelimit-student@mrdevcourses.com")
                .name("Rate Limit Student")
                .role(Role.STUDENT)
                .build();
        testUser = userRepository.save(testUser);
        userToken = jwtTokenProvider.generateToken(testUser);

        Course course = Course.builder()
                .title("Spring Boot Enterprise")
                .slug("spring-boot-enterprise")
                .description("Enterprise grade spring boot")
                .active(true)
                .createdAt(Instant.now())
                .build();
        courseRepository.save(course);
    }

    @Test
    @DisplayName("General tier should enforce 60 req/min limit on /v1/courses and return 429 on 61st")
    void testGeneralTierLimitEnforcement() throws Exception {
        String testIp = "192.0.2.77";

        for (int i = 0; i < 60; i++) {
            mockMvc.perform(get("/v1/courses")
                            .header("X-Forwarded-For", testIp))
                    .andExpect(status().isOk())
                    .andExpect(header().string("X-RateLimit-Remaining", String.valueOf(59 - i)));
        }

        // 61st request must trigger HTTP 429
        mockMvc.perform(get("/v1/courses")
                        .header("X-Forwarded-For", testIp))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().string("X-RateLimit-Remaining", "0"))
                .andExpect(header().exists("Retry-After"))
                .andExpect(jsonPath("$.status", is(429)))
                .andExpect(jsonPath("$.error", is("Too Many Requests")))
                .andExpect(jsonPath("$.message", containsString("Слишком много запросов")));
    }

    @Test
    @DisplayName("Auth tier should enforce 10 req/15min limit on /v1/auth/logout and return 429 on 11th")
    void testAuthTierLimitEnforcement() throws Exception {
        String testIp = "198.51.100.88";

        for (int i = 0; i < 10; i++) {
            mockMvc.perform(post("/v1/auth/logout")
                            .header("X-Forwarded-For", testIp))
                    .andExpect(status().isOk())
                    .andExpect(header().string("X-RateLimit-Remaining", String.valueOf(9 - i)));
        }

        // 11th request must trigger HTTP 429
        mockMvc.perform(post("/v1/auth/logout")
                        .header("X-Forwarded-For", testIp))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().string("X-RateLimit-Remaining", "0"))
                .andExpect(header().exists("Retry-After"))
                .andExpect(jsonPath("$.status", is(429)))
                .andExpect(jsonPath("$.error", is("Too Many Requests")));
    }

    @Test
    @DisplayName("Different IP addresses must not interfere with each other's rate limit buckets")
    void testIpIsolation() throws Exception {
        String ipA = "198.51.100.101";
        String ipB = "198.51.100.102";

        // Exhaust ipA auth quota
        for (int i = 0; i < 10; i++) {
            mockMvc.perform(post("/v1/auth/logout")
                            .header("X-Forwarded-For", ipA))
                    .andExpect(status().isOk());
        }

        mockMvc.perform(post("/v1/auth/logout")
                        .header("X-Forwarded-For", ipA))
                .andExpect(status().isTooManyRequests());

        // ipB must still have full quota
        mockMvc.perform(post("/v1/auth/logout")
                        .header("X-Forwarded-For", ipB))
                .andExpect(status().isOk())
                .andExpect(header().string("X-RateLimit-Remaining", "9"));
    }

    @Test
    @DisplayName("Authenticated user gets authenticated quota isolated from anonymous traffic")
    void testAuthenticatedUserQuota() throws Exception {
        mockMvc.perform(get("/v1/auth/me")
                        .cookie(new Cookie("mrdevcourses_token", userToken)))
                .andExpect(status().isOk())
                .andExpect(header().string("X-RateLimit-Remaining", "9"));
    }
}
