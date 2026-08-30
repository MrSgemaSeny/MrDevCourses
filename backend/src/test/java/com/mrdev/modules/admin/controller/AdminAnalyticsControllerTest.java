package com.mrdev.modules.admin.controller;

import com.mrdev.modules.ai.rag.repository.GlossaryEmbeddingRepository;
import com.mrdev.modules.ai.rag.repository.LessonChunkRepository;
import com.mrdev.modules.audit.model.AuditLog;
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
import com.mrdev.modules.quiz.model.Quiz;
import com.mrdev.modules.quiz.model.QuizQuestion;
import com.mrdev.modules.quiz.model.QuizQuestionOption;
import com.mrdev.modules.quiz.model.QuizSubmission;
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
import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
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
    private Quiz testQuiz;
    private QuizQuestion testQuestion;
    private QuizQuestionOption opt1;
    private QuizQuestionOption opt2;

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

        // Seed Quiz with questions & options
        testQuiz = Quiz.builder()
                .lesson(testLesson)
                .title("Intro Assessment")
                .passingScorePercentage(80)
                .maxAttempts(3)
                .timeLimitSeconds(300)
                .build();
        testQuiz = quizRepository.save(testQuiz);

        testQuestion = QuizQuestion.builder()
                .quiz(testQuiz)
                .questionText("What is Spring Boot?")
                .sortOrder(1)
                .points(1)
                .build();
        testQuestion = quizQuestionRepository.save(testQuestion);

        opt1 = QuizQuestionOption.builder()
                .question(testQuestion)
                .optionText("Framework (Correct)")
                .isCorrect(true)
                .sortOrder(1)
                .build();
        opt1 = quizQuestionOptionRepository.save(opt1);

        opt2 = QuizQuestionOption.builder()
                .question(testQuestion)
                .optionText("Database (Wrong)")
                .isCorrect(false)
                .sortOrder(2)
                .build();
        opt2 = quizQuestionOptionRepository.save(opt2);

        // Seed Quiz Submission (failed)
        QuizSubmission submission = QuizSubmission.builder()
                .quiz(testQuiz)
                .user(studentUser)
                .scorePercentage(0)
                .passed(false)
                .answersPayload("{\"" + testQuestion.getId() + "\": [" + opt2.getId() + "]}")
                .startedAt(Instant.now())
                .completedAt(Instant.now())
                .build();
        quizSubmissionRepository.save(submission);

        // Seed AI Tutor query in Audit Logs
        AuditLog aiLog = AuditLog.builder()
                .user(studentUser)
                .action("AI_TUTOR_QUERY")
                .entityType("Lesson")
                .entityId(testLesson.getId())
                .details("Asked AI tutor on lesson: " + testLesson.getTitle())
                .createdAt(Instant.now())
                .build();
        auditLogRepository.save(aiLog);
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

    @Test
    @DisplayName("GET /v1/admin/analytics/ai-tutor/summary as ADMIN returns AI telemetry metrics")
    void getAiTutorSummary_AsAdmin_ReturnsSummary() throws Exception {
        mockMvc.perform(get("/v1/admin/analytics/ai-tutor/summary")
                        .cookie(new Cookie("MrDev_token", adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.totalQuestions", is(1)))
                .andExpect(jsonPath("$.data.activeUsersCount", is(1)))
                .andExpect(jsonPath("$.data.estimatedTokensUsed", is(340)))
                .andExpect(jsonPath("$.data.topLessonTopics", hasSize(1)))
                .andExpect(jsonPath("$.data.topLessonTopics[0].lessonTitle", is("Day 1: Intro")));
    }

    @Test
    @DisplayName("GET /v1/admin/analytics/quizzes/hotspots as ADMIN returns hotspots with failure rates")
    void getQuizHotspots_AsAdmin_ReturnsHotspots() throws Exception {
        mockMvc.perform(get("/v1/admin/analytics/quizzes/hotspots")
                        .cookie(new Cookie("MrDev_token", adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].questionText", is("What is Spring Boot?")))
                .andExpect(jsonPath("$.data[0].totalAttempts", is(1)))
                .andExpect(jsonPath("$.data[0].failureCount", is(1)))
                .andExpect(jsonPath("$.data[0].failureRate", is(100.0)))
                .andExpect(jsonPath("$.data[0].mostCommonWrongOption", is("Database (Wrong)")));
    }

    @Test
    @DisplayName("GET /v1/admin/analytics/export as ADMIN with format=json returns aggregated payload")
    void exportAnalytics_Json_ReturnsExportPayload() throws Exception {
        mockMvc.perform(get("/v1/admin/analytics/export")
                        .param("courseId", testCourse.getId().toString())
                        .param("format", "json")
                        .cookie(new Cookie("MrDev_token", adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.courseTitle", is("Analytics Test Course")))
                .andExpect(jsonPath("$.data.overview.totalStudents", is(1)))
                .andExpect(jsonPath("$.data.funnel", hasSize(3)))
                .andExpect(jsonPath("$.data.aiTutorSummary.totalQuestions", is(1)))
                .andExpect(jsonPath("$.data.quizHotspots", hasSize(1)));
    }

    @Test
    @DisplayName("GET /v1/admin/analytics/export as ADMIN with format=csv returns CSV file attachment")
    void exportAnalytics_Csv_ReturnsCsvFile() throws Exception {
        mockMvc.perform(get("/v1/admin/analytics/export")
                        .param("courseId", testCourse.getId().toString())
                        .param("format", "csv")
                        .cookie(new Cookie("MrDev_token", adminToken)))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", containsString("text/csv")))
                .andExpect(header().string("Content-Disposition", containsString("analytics-report-")))
                .andExpect(content().string(containsString("=== 1. PLATFORM OVERVIEW KPIS ===")))
                .andExpect(content().string(containsString("=== 2. COURSE FUNNEL DROP-OFF ===")))
                .andExpect(content().string(containsString("=== 3. LESSON RETENTION MATRIX ===")))
                .andExpect(content().string(containsString("=== 6. QUIZ FAILURE HOTSPOTS ===")));
    }
}
