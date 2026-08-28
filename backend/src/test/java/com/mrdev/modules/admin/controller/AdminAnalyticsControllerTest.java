package com.mrdev.modules.admin.controller;

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
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.time.LocalDate;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminAnalyticsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CourseModuleRepository courseModuleRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

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
        lessonRepository.deleteAll();
        courseModuleRepository.deleteAll();
        enrollmentRepository.deleteAll();
        courseRepository.deleteAll();
        userRepository.deleteAll();

        studentUser = User.builder()
                .email("student@test.com")
                .name("Student User")
                .role(Role.STUDENT)
                .currentStreak(3)
                .lastActiveDate(LocalDate.now())
                .build();
        studentUser = userRepository.save(studentUser);
        studentToken = jwtTokenProvider.generateToken(studentUser);

        adminUser = User.builder()
                .email("admin@test.com")
                .name("Admin User")
                .role(Role.ADMIN)
                .currentStreak(7)
                .lastActiveDate(LocalDate.now())
                .build();
        adminUser = userRepository.save(adminUser);
        adminToken = jwtTokenProvider.generateToken(adminUser);

        testCourse = Course.builder()
                .title("Analytics Test Course")
                .description("Course for analytics verification")
                .slug("analytics-course")
                .active(true)
                .createdAt(Instant.now())
                .build();
        testCourse = courseRepository.save(testCourse);

        testLesson = Lesson.builder()
                .course(testCourse)
                .title("Day 1: Intro")
                .dayNumber(1)
                .sortOrder(1)
                .createdAt(Instant.now())
                .build();
        testLesson = lessonRepository.save(testLesson);

        Enrollment enrollment = Enrollment.builder()
                .user(studentUser)
                .course(testCourse)
                .enrolledAt(Instant.now())
                .build();
        enrollmentRepository.save(enrollment);

        LessonProgress progress = LessonProgress.builder()
                .user(studentUser)
                .lesson(testLesson)
                .completedAt(Instant.now())
                .build();
        lessonProgressRepository.save(progress);
    }

    @Test
    @DisplayName("GET /v1/admin/analytics/overview unauthenticated returns 401")
    void getOverview_Unauthenticated_Returns401() throws Exception {
        mockMvc.perform(get("/v1/admin/analytics/overview"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /v1/admin/analytics/overview as STUDENT returns 403")
    void getOverview_AsStudent_Returns403() throws Exception {
        mockMvc.perform(get("/v1/admin/analytics/overview")
                        .cookie(new Cookie("MrDev_token", studentToken)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /v1/admin/analytics/overview as ADMIN returns 200 and metrics")
    void getOverview_AsAdmin_Returns200() throws Exception {
        mockMvc.perform(get("/v1/admin/analytics/overview")
                        .cookie(new Cookie("MrDev_token", adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.totalStudents", is(1)))
                .andExpect(jsonPath("$.data.totalEnrollments", is(1)))
                .andExpect(jsonPath("$.data.totalLessonsCompleted", is(1)))
                .andExpect(jsonPath("$.data.totalCompletions", is(1)))
                .andExpect(jsonPath("$.data.averageStreak", is(3.0)))
                .andExpect(jsonPath("$.data.activeStudents", is(1)))
                .andExpect(jsonPath("$.data.completionRate", is(100.0)));
    }

    @Test
    @DisplayName("GET /v1/admin/analytics/courses/{courseId}/funnel as ADMIN returns funnel stages")
    void getCourseFunnel_AsAdmin_ReturnsFunnel() throws Exception {
        mockMvc.perform(get("/v1/admin/analytics/courses/" + testCourse.getId() + "/funnel")
                        .cookie(new Cookie("MrDev_token", adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(3))) // Enrolled -> Day 1 -> Completed
                .andExpect(jsonPath("$.data[0].stepName", is("Зачислено на курс")))
                .andExpect(jsonPath("$.data[0].studentsCount", is(1)))
                .andExpect(jsonPath("$.data[1].stepName", is("День 1: Day 1: Intro")))
                .andExpect(jsonPath("$.data[1].studentsCount", is(1)))
                .andExpect(jsonPath("$.data[2].stepName", is("Курс завершен (100%)")))
                .andExpect(jsonPath("$.data[2].studentsCount", is(1)));
    }

    @Test
    @DisplayName("GET /v1/admin/analytics/streaks as ADMIN returns 5 streak buckets")
    void getStreaks_AsAdmin_ReturnsBuckets() throws Exception {
        mockMvc.perform(get("/v1/admin/analytics/streaks")
                        .cookie(new Cookie("MrDev_token", adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(5)))
                .andExpect(jsonPath("$.data[1].range", is("1-3 дня")))
                .andExpect(jsonPath("$.data[1].count", is(1)))
                .andExpect(jsonPath("$.data[1].percentage", is(100.0)));
    }

    @Test
    @DisplayName("GET /v1/admin/analytics/courses/{courseId}/retention as ADMIN returns retention data")
    void getCourseRetention_AsAdmin_ReturnsRetention() throws Exception {
        mockMvc.perform(get("/v1/admin/analytics/courses/" + testCourse.getId() + "/retention")
                        .cookie(new Cookie("MrDev_token", adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.courseId", is(testCourse.getId().intValue())))
                .andExpect(jsonPath("$.data.totalEnrolled", is(1)))
                .andExpect(jsonPath("$.data.completedCount", is(1)))
                .andExpect(jsonPath("$.data.overallCompletionRate", is(100.0)))
                .andExpect(jsonPath("$.data.lessonRetention", hasSize(1)))
                .andExpect(jsonPath("$.data.lessonRetention[0].lessonTitle", is("Day 1: Intro")))
                .andExpect(jsonPath("$.data.lessonRetention[0].completedCount", is(1)));
    }
}
