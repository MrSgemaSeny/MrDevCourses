package com.mrdev.modules.admin.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mrdev.modules.admin.dto.StudentRoleUpdateRequest;
import com.mrdev.modules.ai.rag.repository.GlossaryEmbeddingRepository;
import com.mrdev.modules.ai.rag.repository.LessonChunkRepository;
import com.mrdev.modules.audit.repository.AuditLogRepository;
import com.mrdev.modules.auth.model.Role;
import com.mrdev.modules.auth.model.User;
import com.mrdev.modules.auth.repository.UserRepository;
import com.mrdev.modules.auth.service.JwtTokenProvider;
import com.mrdev.modules.automation.repository.OutboxEventRepository;
import com.mrdev.modules.course.model.Course;
import com.mrdev.modules.course.model.Enrollment;
import com.mrdev.modules.course.repository.CohortRepository;
import com.mrdev.modules.course.repository.CourseModuleRepository;
import com.mrdev.modules.course.repository.CourseRepository;
import com.mrdev.modules.course.repository.EnrollmentRepository;
import com.mrdev.modules.homework.repository.HomeworkSubmissionRepository;
import com.mrdev.modules.lesson.model.Lesson;
import com.mrdev.modules.lesson.model.LessonProgress;
import com.mrdev.modules.lesson.repository.LessonMaterialRepository;
import com.mrdev.modules.lesson.repository.LessonProgressRepository;
import com.mrdev.modules.lesson.repository.LessonRepository;
import com.mrdev.modules.quiz.repository.QuizQuestionOptionRepository;
import com.mrdev.modules.quiz.repository.QuizQuestionRepository;
import com.mrdev.modules.quiz.repository.QuizRepository;
import com.mrdev.modules.quiz.repository.QuizSubmissionRepository;
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
import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminStudentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CourseModuleRepository courseModuleRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private CohortRepository cohortRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private LessonMaterialRepository lessonMaterialRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuizQuestionRepository quizQuestionRepository;

    @Autowired
    private QuizQuestionOptionRepository quizQuestionOptionRepository;

    @Autowired
    private QuizSubmissionRepository quizSubmissionRepository;

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

    private User studentUser;
    private User adminUser;
    private User secondAdmin;
    private String studentToken;
    private String adminToken;
    private Course testCourse;
    private Lesson testLesson;

    @BeforeEach
    void setUp() {
        auditLogRepository.deleteAll();
        outboxEventRepository.deleteAll();
        homeworkSubmissionRepository.deleteAll();
        quizSubmissionRepository.deleteAll();
        quizQuestionOptionRepository.deleteAll();
        quizQuestionRepository.deleteAll();
        quizRepository.deleteAll();
        lessonMaterialRepository.deleteAll();
        lessonProgressRepository.deleteAll();
        lessonChunkRepository.deleteAll();
        glossaryEmbeddingRepository.deleteAll();
        cohortRepository.deleteAll();
        lessonRepository.deleteAll();
        courseModuleRepository.deleteAll();
        enrollmentRepository.deleteAll();
        courseRepository.deleteAll();
        userRepository.deleteAll();

        adminUser = User.builder()
                .email("mainadmin@test.com")
                .name("Super Admin")
                .role(Role.ADMIN)
                .lastActiveDate(LocalDate.now())
                .build();
        adminUser = userRepository.save(adminUser);
        adminToken = jwtTokenProvider.generateToken(adminUser);

        secondAdmin = User.builder()
                .email("secondaryadmin@test.com")
                .name("Second Admin")
                .role(Role.ADMIN)
                .lastActiveDate(LocalDate.now())
                .build();
        secondAdmin = userRepository.save(secondAdmin);

        studentUser = User.builder()
                .email("student1@test.com")
                .name("Alex Student")
                .role(Role.STUDENT)
                .lastActiveDate(LocalDate.now())
                .build();
        studentUser = userRepository.save(studentUser);
        studentToken = jwtTokenProvider.generateToken(studentUser);

        testCourse = Course.builder()
                .title("Architecture in Practice")
                .slug("arch-in-practice")
                .description("Advanced Spring Boot & React")
                .active(true)
                .build();
        testCourse = courseRepository.save(testCourse);

        testLesson = Lesson.builder()
                .course(testCourse)
                .title("Lesson 1: Domain Modeling")
                .content("Detailed markdown content")
                .dayNumber(1)
                .sortOrder(1)
                .build();
        testLesson = lessonRepository.save(testLesson);

        Enrollment enrollment = Enrollment.builder()
                .user(studentUser)
                .course(testCourse)
                .enrolledAt(Instant.now())
                .build();
        enrollmentRepository.save(enrollment);
    }

    @Test
    @DisplayName("GET /v1/admin/students should return paginated list of students")
    void searchStudents_AsAdmin_ShouldReturnPage() throws Exception {
        mockMvc.perform(get("/v1/admin/students")
                        .cookie(new Cookie("MrDev_token", adminToken))
                        .param("q", "alex")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.content[0].email", is("student1@test.com")))
                .andExpect(jsonPath("$.data.totalElements", is(1)));
    }

    @Test
    @DisplayName("GET /v1/admin/students as STUDENT should return 403 Forbidden")
    void searchStudents_AsStudent_ShouldReturnForbidden() throws Exception {
        mockMvc.perform(get("/v1/admin/students")
                        .cookie(new Cookie("MrDev_token", studentToken)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("PATCH /v1/admin/students/{userId}/role to ADMIN promotes student")
    void updateStudentRole_PromoteToAdmin_ShouldSucceed() throws Exception {
        StudentRoleUpdateRequest request = StudentRoleUpdateRequest.builder()
                .role(Role.ADMIN)
                .build();

        mockMvc.perform(patch("/v1/admin/students/" + studentUser.getId() + "/role")
                        .cookie(new Cookie("MrDev_token", adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.role", is("ADMIN")));
    }

    @Test
    @DisplayName("PATCH /v1/admin/students/{userId}/role demoting self should return 403 Forbidden")
    void updateStudentRole_SelfDemotion_ShouldFail() throws Exception {
        StudentRoleUpdateRequest request = StudentRoleUpdateRequest.builder()
                .role(Role.STUDENT)
                .build();

        mockMvc.perform(patch("/v1/admin/students/" + adminUser.getId() + "/role")
                        .cookie(new Cookie("MrDev_token", adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message", containsString("Cannot demote yourself")));
    }

    @Test
    @DisplayName("PATCH /v1/admin/students/{userId}/role demoting last admin should return 400 Bad Request")
    void updateStudentRole_LastAdmin_ShouldFail() throws Exception {
        // Delete secondary admin so adminUser is the only admin
        userRepository.delete(secondAdmin);

        // We try from another admin token (simulate attempt when count=1)
        StudentRoleUpdateRequest request = StudentRoleUpdateRequest.builder()
                .role(Role.STUDENT)
                .build();

        // Create temporary 2nd admin just to send the request as admin
        User callerAdmin = User.builder().email("caller@test.com").role(Role.ADMIN).build();
        callerAdmin = userRepository.save(callerAdmin);
        String callerToken = jwtTokenProvider.generateToken(callerAdmin);

        // Now demote callerAdmin itself? No, demote adminUser when callerAdmin is also admin, but let's test count=1
        userRepository.delete(callerAdmin); // Now only adminUser is ADMIN (count=1)

        // Try demoting adminUser via callerToken (caller has ADMIN role in JWT)
        mockMvc.perform(patch("/v1/admin/students/" + adminUser.getId() + "/role")
                        .cookie(new Cookie("MrDev_token", callerToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Cannot demote the last administrator")));
    }

    @Test
    @DisplayName("POST and DELETE /v1/admin/students/{userId}/enroll/{courseId} should enroll and unenroll")
    void enrollAndUnenrollStudent_ShouldSucceed() throws Exception {
        Course course2 = Course.builder().title("Second Course").slug("second-course").active(true).build();
        course2 = courseRepository.save(course2);

        // 1. Enroll
        mockMvc.perform(post("/v1/admin/students/" + studentUser.getId() + "/enroll/" + course2.getId())
                        .cookie(new Cookie("MrDev_token", adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.courseId", is(course2.getId().intValue())));

        // 2. Unenroll
        mockMvc.perform(delete("/v1/admin/students/" + studentUser.getId() + "/enroll/" + course2.getId())
                        .cookie(new Cookie("MrDev_token", adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }

    @Test
    @DisplayName("GET /v1/admin/students/{userId}/progress should return full progress inspection")
    void getStudentProgress_ShouldReturnDetails() throws Exception {
        LessonProgress lp = LessonProgress.builder()
                .user(studentUser)
                .lesson(testLesson)
                .completedAt(Instant.now())
                .build();
        lessonProgressRepository.save(lp);

        mockMvc.perform(get("/v1/admin/students/" + studentUser.getId() + "/progress")
                        .cookie(new Cookie("MrDev_token", adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.userId", is(studentUser.getId().intValue())))
                .andExpect(jsonPath("$.data.completedLessons", hasSize(1)))
                .andExpect(jsonPath("$.data.completedLessons[0].lessonId", is(testLesson.getId().intValue())));
    }
}
