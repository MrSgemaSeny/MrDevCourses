package com.mrdevcourses.modules.automation.controller;

import com.mrdevcourses.modules.ai.rag.repository.GlossaryEmbeddingRepository;
import com.mrdevcourses.modules.ai.rag.repository.LessonChunkRepository;
import com.mrdevcourses.modules.audit.repository.AuditLogRepository;
import com.mrdevcourses.modules.auth.model.Role;
import com.mrdevcourses.modules.auth.model.User;
import com.mrdevcourses.modules.auth.repository.UserRepository;
import com.mrdevcourses.modules.auth.service.JwtTokenProvider;
import com.mrdevcourses.modules.automation.model.OutboxEvent;
import com.mrdevcourses.modules.automation.model.OutboxStatus;
import com.mrdevcourses.modules.automation.repository.OutboxEventRepository;
import com.mrdevcourses.modules.course.model.Course;
import com.mrdevcourses.modules.course.repository.CourseRepository;
import com.mrdevcourses.modules.course.repository.EnrollmentRepository;
import com.mrdevcourses.modules.homework.repository.HomeworkSubmissionRepository;
import com.mrdevcourses.modules.lesson.repository.LessonProgressRepository;
import com.mrdevcourses.modules.lesson.repository.LessonRepository;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AutomationAdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

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
    private LessonChunkRepository lessonChunkRepository;

    @Autowired
    private GlossaryEmbeddingRepository glossaryEmbeddingRepository;

    @Autowired
    private HomeworkSubmissionRepository homeworkSubmissionRepository;

    @Autowired
    private OutboxEventRepository outboxEventRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User adminUser;
    private String adminToken;
    private Course testCourse;

    @BeforeEach
    void setUp() {
        auditLogRepository.deleteAll();
        outboxEventRepository.deleteAll();
        homeworkSubmissionRepository.deleteAll();
        lessonProgressRepository.deleteAll();
        lessonChunkRepository.deleteAll();
        glossaryEmbeddingRepository.deleteAll();
        lessonRepository.deleteAll();
        enrollmentRepository.deleteAll();
        courseRepository.deleteAll();
        userRepository.deleteAll();

        adminUser = User.builder()
                .email("admin_auto@test.com")
                .name("Admin Auto")
                .role(Role.ADMIN)
                .build();
        adminUser = userRepository.save(adminUser);
        adminToken = jwtTokenProvider.generateToken(adminUser);

        testCourse = Course.builder()
                .title("Auto Course")
                .description("Course description")
                .slug("auto-course")
                .active(true)
                .createdAt(Instant.now())
                .build();
        testCourse = courseRepository.save(testCourse);
    }

    @Test
    @DisplayName("GET /api/v1/admin/automation/outbox-metrics as ADMIN returns outbox counts")
    void getOutboxMetrics_AsAdmin_ReturnsCounts() throws Exception {
        OutboxEvent event = OutboxEvent.builder()
                .aggregateType("COURSE")
                .aggregateId(testCourse.getId())
                .eventType("COURSE_INGESTION_REQUESTED")
                .payload("{}")
                .status(OutboxStatus.PENDING)
                .build();
        outboxEventRepository.save(event);

        mockMvc.perform(get("/api/v1/admin/automation/outbox-metrics")
                        .cookie(new Cookie("mrdevcourses_token", adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.pendingCount", is(1)));
    }

    @Test
    @DisplayName("POST /api/v1/courses/{courseId}/semantic-links extracts links from text")
    void extractSemanticLinks_ReturnsLinks() throws Exception {
        mockMvc.perform(post("/api/v1/courses/" + testCourse.getId() + "/semantic-links")
                        .cookie(new Cookie("mrdevcourses_token", adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"text\": \"Применение RAG и FSD в проекте\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }
}
