package com.mrdev.modules.admin.controller;

import com.mrdev.common.ratelimit.RateLimitTier;
import com.mrdev.common.ratelimit.RateLimiterService;
import com.mrdev.modules.auth.model.Role;
import com.mrdev.modules.auth.model.User;
import com.mrdev.modules.auth.repository.UserRepository;
import com.mrdev.modules.auth.service.JwtTokenProvider;
import com.mrdev.modules.automation.model.OutboxEvent;
import com.mrdev.modules.automation.model.OutboxStatus;
import com.mrdev.modules.automation.repository.OutboxEventRepository;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminSystemControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.mrdev.modules.audit.repository.AuditLogRepository auditLogRepository;

    @Autowired
    private com.mrdev.modules.homework.repository.HomeworkSubmissionRepository homeworkSubmissionRepository;

    @Autowired
    private com.mrdev.modules.course.repository.EnrollmentRepository enrollmentRepository;

    @Autowired
    private com.mrdev.modules.lesson.repository.LessonProgressRepository lessonProgressRepository;

    @Autowired
    private OutboxEventRepository outboxEventRepository;

    @Autowired
    private RateLimiterService rateLimiterService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User studentUser;
    private User adminUser;
    private String studentToken;
    private String adminToken;

    @BeforeEach
    void setUp() {
        rateLimiterService.reset();
        auditLogRepository.deleteAll();
        homeworkSubmissionRepository.deleteAll();
        lessonProgressRepository.deleteAll();
        enrollmentRepository.deleteAll();
        outboxEventRepository.deleteAll();
        userRepository.deleteAll();

        studentUser = User.builder()
                .email("student_sys@test.com")
                .name("Student Sys")
                .role(Role.STUDENT)
                .build();
        studentUser = userRepository.save(studentUser);
        studentToken = jwtTokenProvider.generateToken(studentUser);

        adminUser = User.builder()
                .email("admin_sys@test.com")
                .name("Admin Sys")
                .role(Role.ADMIN)
                .build();
        adminUser = userRepository.save(adminUser);
        adminToken = jwtTokenProvider.generateToken(adminUser);
    }

    @Test
    @DisplayName("GET /v1/admin/system/rate-limits unauthenticated returns 401")
    void getRateLimits_Unauthenticated_Returns401() throws Exception {
        mockMvc.perform(get("/v1/admin/system/rate-limits"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /v1/admin/system/rate-limits as STUDENT returns 403")
    void getRateLimits_AsStudent_Returns403() throws Exception {
        mockMvc.perform(get("/v1/admin/system/rate-limits")
                        .cookie(new Cookie("MrDev_token", studentToken)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /v1/admin/system/rate-limits as ADMIN returns telemetry")
    void getRateLimits_AsAdmin_ReturnsTelemetry() throws Exception {
        // Exercise rate limiter to populate metrics
        rateLimiterService.resolveBucket("user:123", RateLimitTier.GENERAL);
        rateLimiterService.resolveBucket("ip:127.0.0.1", RateLimitTier.AUTH);
        rateLimiterService.recordThrottle(RateLimitTier.AI, "user:123", "/v1/ai/tutor/ask", 12);

        mockMvc.perform(get("/v1/admin/system/rate-limits")
                        .cookie(new Cookie("MrDev_token", adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.totalActiveBuckets", greaterThanOrEqualTo(2)))
                .andExpect(jsonPath("$.data.totalThrottledRequests", is(1)))
                .andExpect(jsonPath("$.data.tiers.AUTH.capacity", is(10)))
                .andExpect(jsonPath("$.data.tiers.AI.capacity", is(5)))
                .andExpect(jsonPath("$.data.tiers.GENERAL.capacity", is(60)))
                .andExpect(jsonPath("$.data.recentThrottles", hasSize(1)))
                .andExpect(jsonPath("$.data.recentThrottles[0].tier", is("AI")))
                .andExpect(jsonPath("$.data.recentThrottles[0].path", is("/v1/ai/tutor/ask")))
                .andExpect(jsonPath("$.data.recentThrottles[0].retryAfterSeconds", is(12)));
    }

    @Test
    @DisplayName("GET /v1/admin/system/health unauthenticated returns 401")
    void getHealth_Unauthenticated_Returns401() throws Exception {
        mockMvc.perform(get("/v1/admin/system/health"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /v1/admin/system/health as STUDENT returns 403")
    void getHealth_AsStudent_Returns403() throws Exception {
        mockMvc.perform(get("/v1/admin/system/health")
                        .cookie(new Cookie("MrDev_token", studentToken)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /v1/admin/system/health as ADMIN returns database, pool, flyway, outbox, and jvm stats")
    void getHealth_AsAdmin_ReturnsSystemHealth() throws Exception {
        OutboxEvent event = OutboxEvent.builder()
                .aggregateType("COURSE")
                .aggregateId(1L)
                .eventType("COURSE_UPDATED")
                .payload("{}")
                .status(OutboxStatus.PENDING)
                .build();
        outboxEventRepository.save(event);

        mockMvc.perform(get("/v1/admin/system/health")
                        .cookie(new Cookie("MrDev_token", adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.status", is("UP")))
                .andExpect(jsonPath("$.data.database.status", is("UP")))
                .andExpect(jsonPath("$.data.databasePool.maxPoolSize", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.data.flyway.state", notNullValue()))
                .andExpect(jsonPath("$.data.outboxQueue.totalCount", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.data.jvm.availableProcessors", greaterThan(0)))
                .andExpect(jsonPath("$.data.jvm.totalMemoryBytes", greaterThan(0)));
    }
}
