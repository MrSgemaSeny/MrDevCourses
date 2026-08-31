package com.mrdev.modules.admin.controller;

import com.mrdev.modules.audit.model.AuditLog;
import com.mrdev.modules.audit.repository.AuditLogRepository;
import com.mrdev.modules.auth.model.Role;
import com.mrdev.modules.auth.model.User;
import com.mrdev.modules.auth.repository.UserRepository;
import com.mrdev.modules.auth.service.JwtTokenProvider;
import com.mrdev.modules.course.repository.CourseModuleRepository;
import com.mrdev.modules.course.repository.CourseRepository;
import com.mrdev.modules.course.repository.EnrollmentRepository;
import com.mrdev.modules.lesson.repository.LessonRepository;
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
import java.time.temporal.ChronoUnit;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminAuditControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CourseModuleRepository courseModuleRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private com.mrdev.modules.homework.repository.HomeworkSubmissionRepository homeworkSubmissionRepository;

    @Autowired
    private com.mrdev.modules.lesson.repository.LessonProgressRepository lessonProgressRepository;

    @Autowired
    private com.mrdev.modules.lesson.repository.LessonMaterialRepository lessonMaterialRepository;

    @Autowired
    private com.mrdev.modules.quiz.repository.QuizSubmissionRepository quizSubmissionRepository;

    @Autowired
    private com.mrdev.modules.quiz.repository.QuizQuestionOptionRepository quizQuestionOptionRepository;

    @Autowired
    private com.mrdev.modules.quiz.repository.QuizQuestionRepository quizQuestionRepository;

    @Autowired
    private com.mrdev.modules.quiz.repository.QuizRepository quizRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User studentUser;
    private User adminUser;
    private String studentToken;
    private String adminToken;

    @BeforeEach
    void setUp() {
        auditLogRepository.deleteAll();
        homeworkSubmissionRepository.deleteAll();
        quizSubmissionRepository.deleteAll();
        quizQuestionOptionRepository.deleteAll();
        quizQuestionRepository.deleteAll();
        quizRepository.deleteAll();
        lessonMaterialRepository.deleteAll();
        lessonProgressRepository.deleteAll();
        enrollmentRepository.deleteAll();
        lessonRepository.deleteAll();
        courseModuleRepository.deleteAll();
        courseRepository.deleteAll();
        userRepository.deleteAll();

        studentUser = User.builder()
                .email("student_audit@test.com")
                .name("Student User")
                .role(Role.STUDENT)
                .build();
        studentUser = userRepository.save(studentUser);
        studentToken = jwtTokenProvider.generateToken(studentUser);

        adminUser = User.builder()
                .email("admin_audit@test.com")
                .name("Admin User")
                .role(Role.ADMIN)
                .build();
        adminUser = userRepository.save(adminUser);
        adminToken = jwtTokenProvider.generateToken(adminUser);
    }

    @Test
    @DisplayName("GET /v1/admin/audit-logs unauthenticated returns 401")
    void getAuditLogs_Unauthenticated_Returns401() throws Exception {
        mockMvc.perform(get("/v1/admin/audit-logs"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /v1/admin/audit-logs as STUDENT returns 403")
    void getAuditLogs_AsStudent_Returns403() throws Exception {
        mockMvc.perform(get("/v1/admin/audit-logs")
                        .cookie(new Cookie("MrDev_token", studentToken)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /v1/admin/audit-logs as ADMIN returns paginated logs")
    void getAuditLogs_AsAdmin_ReturnsPaginatedLogs() throws Exception {
        AuditLog log1 = AuditLog.builder()
                .user(adminUser)
                .action("COURSE_CREATED")
                .entityType("COURSE")
                .entityId(10L)
                .details("Created course Architecture")
                .ipAddress("127.0.0.1")
                .createdAt(Instant.now().minus(2, ChronoUnit.HOURS))
                .build();
        AuditLog log2 = AuditLog.builder()
                .user(studentUser)
                .action("LESSON_COMPLETED")
                .entityType("LESSON")
                .entityId(25L)
                .details("Completed lesson 1")
                .ipAddress("192.168.1.5")
                .createdAt(Instant.now().minus(1, ChronoUnit.HOURS))
                .build();
        auditLogRepository.save(log1);
        auditLogRepository.save(log2);

        mockMvc.perform(get("/v1/admin/audit-logs")
                        .cookie(new Cookie("MrDev_token", adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.content", hasSize(2)))
                .andExpect(jsonPath("$.data.totalElements", is(2)))
                .andExpect(jsonPath("$.data.content[0].action", is("LESSON_COMPLETED")))
                .andExpect(jsonPath("$.data.content[0].userEmail", is("student_audit@test.com")))
                .andExpect(jsonPath("$.data.content[1].action", is("COURSE_CREATED")))
                .andExpect(jsonPath("$.data.content[1].userEmail", is("admin_audit@test.com")));
    }

    @Test
    @DisplayName("GET /v1/admin/audit-logs filter by action, entityType and userId")
    void getAuditLogs_WithFilters_ReturnsFilteredLogs() throws Exception {
        AuditLog log1 = AuditLog.builder()
                .user(adminUser)
                .action("ROLE_CHANGED")
                .entityType("USER")
                .entityId(studentUser.getId())
                .details("Changed role to ADMIN")
                .ipAddress("10.0.0.1")
                .createdAt(Instant.now())
                .build();
        AuditLog log2 = AuditLog.builder()
                .user(adminUser)
                .action("COURSE_DELETED")
                .entityType("COURSE")
                .entityId(99L)
                .details("Deleted course 99")
                .ipAddress("10.0.0.1")
                .createdAt(Instant.now())
                .build();
        auditLogRepository.save(log1);
        auditLogRepository.save(log2);

        mockMvc.perform(get("/v1/admin/audit-logs")
                        .param("action", "ROLE_CHANGED")
                        .param("entityType", "USER")
                        .param("userId", adminUser.getId().toString())
                        .cookie(new Cookie("MrDev_token", adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.content[0].action", is("ROLE_CHANGED")))
                .andExpect(jsonPath("$.data.content[0].entityType", is("USER")));
    }
}
