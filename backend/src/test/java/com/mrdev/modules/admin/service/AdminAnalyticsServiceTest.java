package com.mrdev.modules.admin.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mrdev.common.exception.ResourceNotFoundException;
import com.mrdev.modules.admin.dto.*;
import com.mrdev.modules.audit.model.AuditLog;
import com.mrdev.modules.audit.repository.AuditLogRepository;
import com.mrdev.modules.auth.model.Role;
import com.mrdev.modules.auth.model.User;
import com.mrdev.modules.auth.repository.UserRepository;
import com.mrdev.modules.course.model.Course;
import com.mrdev.modules.course.model.Enrollment;
import com.mrdev.modules.course.repository.CourseRepository;
import com.mrdev.modules.course.repository.EnrollmentRepository;
import com.mrdev.modules.lesson.model.Lesson;
import com.mrdev.modules.lesson.model.LessonProgress;
import com.mrdev.modules.lesson.repository.LessonProgressRepository;
import com.mrdev.modules.lesson.repository.LessonRepository;
import com.mrdev.modules.quiz.model.Quiz;
import com.mrdev.modules.quiz.model.QuizQuestion;
import com.mrdev.modules.quiz.model.QuizQuestionOption;
import com.mrdev.modules.quiz.model.QuizSubmission;
import com.mrdev.modules.quiz.repository.QuizQuestionRepository;
import com.mrdev.modules.quiz.repository.QuizRepository;
import com.mrdev.modules.quiz.repository.QuizSubmissionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminAnalyticsServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private LessonRepository lessonRepository;

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private LessonProgressRepository lessonProgressRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private QuizRepository quizRepository;

    @Mock
    private QuizSubmissionRepository quizSubmissionRepository;

    @Mock
    private QuizQuestionRepository quizQuestionRepository;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private AdminAnalyticsService adminAnalyticsService;

    private User student1;
    private User student2;
    private User admin;
    private Course course;
    private Lesson lesson1;
    private Lesson lesson2;

    @BeforeEach
    void setUp() {
        student1 = User.builder()
                .id(1L)
                .email("student1@test.com")
                .role(Role.STUDENT)
                .currentStreak(4)
                .lastActiveDate(LocalDate.now())
                .build();

        student2 = User.builder()
                .id(2L)
                .email("student2@test.com")
                .role(Role.STUDENT)
                .currentStreak(0)
                .lastActiveDate(LocalDate.now().minusDays(10))
                .build();

        admin = User.builder()
                .id(3L)
                .email("admin@test.com")
                .role(Role.ADMIN)
                .currentStreak(10)
                .build();

        course = Course.builder()
                .id(100L)
                .title("Full-Stack Course")
                .slug("fullstack")
                .active(true)
                .build();

        lesson1 = Lesson.builder()
                .id(10L)
                .course(course)
                .title("Day 1: Setup")
                .dayNumber(1)
                .sortOrder(1)
                .build();

        lesson2 = Lesson.builder()
                .id(11L)
                .course(course)
                .title("Day 2: Architecture")
                .dayNumber(2)
                .sortOrder(2)
                .build();
    }

    @Test
    @DisplayName("getOverviewMetrics should calculate KPI metrics accurately")
    void getOverviewMetrics_CalculatesCorrectly() {
        when(userRepository.findAll()).thenReturn(List.of(student1, student2, admin));
        when(enrollmentRepository.count()).thenReturn(2L);
        when(lessonProgressRepository.count()).thenReturn(3L);

        Enrollment enr1 = Enrollment.builder().id(1L).user(student1).course(course).build();
        Enrollment enr2 = Enrollment.builder().id(2L).user(student2).course(course).build();

        when(enrollmentRepository.findAllWithCourseAndUser()).thenReturn(List.of(enr1, enr2));
        when(courseRepository.findAll()).thenReturn(List.of(course));
        List<Object[]> lessonCounts = new ArrayList<>();
        lessonCounts.add(new Object[]{100L, 2L});
        when(lessonRepository.countLessonsByCourseIds(List.of(100L))).thenReturn(lessonCounts);

        when(lessonProgressRepository.countCompletedLessonsByUserIdAndCourseId(1L, 100L)).thenReturn(2L);
        when(lessonProgressRepository.countCompletedLessonsByUserIdAndCourseId(2L, 100L)).thenReturn(1L);

        AdminOverviewMetricsDto metrics = adminAnalyticsService.getOverviewMetrics();

        assertThat(metrics).isNotNull();
        assertThat(metrics.getTotalStudents()).isEqualTo(2);
        assertThat(metrics.getTotalEnrollments()).isEqualTo(2);
        assertThat(metrics.getTotalLessonsCompleted()).isEqualTo(3);
        assertThat(metrics.getTotalCompletions()).isEqualTo(1);
        assertThat(metrics.getAverageStreak()).isEqualTo(2.0);
        assertThat(metrics.getActiveStudents()).isEqualTo(1);
        assertThat(metrics.getCompletionRate()).isEqualTo(50.0);
    }

    @Test
    @DisplayName("getCourseFunnel should throw ResourceNotFoundException when course does not exist")
    void getCourseFunnel_WhenNotFound_Throws() {
        when(courseRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminAnalyticsService.getCourseFunnel(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Course");
    }

    @Test
    @DisplayName("getCourseFunnel should compute step conversion and drop-off rates")
    void getCourseFunnel_ComputesRates() {
        when(courseRepository.findById(100L)).thenReturn(Optional.of(course));
        when(enrollmentRepository.countByCourseId(100L)).thenReturn(10L);
        when(lessonRepository.findByCourseIdOrderBySortOrderAscDayNumberAsc(100L)).thenReturn(List.of(lesson1, lesson2));

        List<Object[]> userCounts = new ArrayList<>();
        userCounts.add(new Object[]{10L, 8L});
        userCounts.add(new Object[]{11L, 6L});
        when(lessonProgressRepository.countCompletedUsersByLessonIds(List.of(10L, 11L)))
                .thenReturn(userCounts);

        Enrollment enr1 = Enrollment.builder().id(1L).user(student1).course(course).build();
        Enrollment enr2 = Enrollment.builder().id(2L).user(student2).course(course).build();
        when(enrollmentRepository.findAllByCourseIdWithUser(100L)).thenReturn(List.of(enr1, enr2));

        when(lessonProgressRepository.countCompletedLessonsByUserIdAndCourseId(1L, 100L)).thenReturn(2L);
        when(lessonProgressRepository.countCompletedLessonsByUserIdAndCourseId(2L, 100L)).thenReturn(1L);

        List<CourseFunnelStepDto> funnel = adminAnalyticsService.getCourseFunnel(100L);

        assertThat(funnel).hasSize(4);

        // Step 0: Enrolled
        CourseFunnelStepDto step0 = funnel.get(0);
        assertThat(step0.getStepOrder()).isEqualTo(0);
        assertThat(step0.getStudentsCount()).isEqualTo(10);
        assertThat(step0.getConversionRate()).isEqualTo(100.0);
        assertThat(step0.getDropOffRate()).isEqualTo(0.0);

        // Step 1: Lesson 1
        CourseFunnelStepDto step1 = funnel.get(1);
        assertThat(step1.getStepOrder()).isEqualTo(1);
        assertThat(step1.getStudentsCount()).isEqualTo(8);
        assertThat(step1.getConversionRate()).isEqualTo(80.0);
        assertThat(step1.getDropOffRate()).isEqualTo(20.0);

        // Step 2: Lesson 2
        CourseFunnelStepDto step2 = funnel.get(2);
        assertThat(step2.getStepOrder()).isEqualTo(2);
        assertThat(step2.getStudentsCount()).isEqualTo(6);
        assertThat(step2.getConversionRate()).isEqualTo(60.0);
        assertThat(step2.getDropOffRate()).isEqualTo(25.0);

        // Step 3: Course Completed
        CourseFunnelStepDto step3 = funnel.get(3);
        assertThat(step3.getStepOrder()).isEqualTo(3);
        assertThat(step3.getStudentsCount()).isEqualTo(1);
        assertThat(step3.getConversionRate()).isEqualTo(10.0);
        assertThat(step3.getDropOffRate()).isEqualTo(83.3);
    }

    @Test
    @DisplayName("getStreakDistribution should partition users into 5 streak buckets")
    void getStreakDistribution_CalculatesBuckets() {
        User u1 = User.builder().id(1L).role(Role.STUDENT).currentStreak(0).build();
        User u2 = User.builder().id(2L).role(Role.STUDENT).currentStreak(2).build();
        User u3 = User.builder().id(3L).role(Role.STUDENT).currentStreak(6).build();
        User u4 = User.builder().id(4L).role(Role.STUDENT).currentStreak(10).build();
        User u5 = User.builder().id(5L).role(Role.STUDENT).currentStreak(20).build();

        when(userRepository.findAll()).thenReturn(List.of(u1, u2, u3, u4, u5));

        List<StreakDistributionDto> streaks = adminAnalyticsService.getStreakDistribution();

        assertThat(streaks).hasSize(5);
        assertThat(streaks.get(0).getRange()).isEqualTo("0 дней");
        assertThat(streaks.get(0).getCount()).isEqualTo(1);
        assertThat(streaks.get(0).getPercentage()).isEqualTo(20.0);

        assertThat(streaks.get(1).getRange()).isEqualTo("1-3 дня");
        assertThat(streaks.get(1).getCount()).isEqualTo(1);
        assertThat(streaks.get(1).getPercentage()).isEqualTo(20.0);

        assertThat(streaks.get(2).getRange()).isEqualTo("4-7 дней");
        assertThat(streaks.get(2).getCount()).isEqualTo(1);
        assertThat(streaks.get(2).getPercentage()).isEqualTo(20.0);

        assertThat(streaks.get(3).getRange()).isEqualTo("8-14 дней");
        assertThat(streaks.get(3).getCount()).isEqualTo(1);
        assertThat(streaks.get(3).getPercentage()).isEqualTo(20.0);

        assertThat(streaks.get(4).getRange()).isEqualTo("15+ дней");
        assertThat(streaks.get(4).getCount()).isEqualTo(1);
        assertThat(streaks.get(4).getPercentage()).isEqualTo(20.0);
    }

    @Test
    @DisplayName("getCourseRetention should calculate lesson retention metrics and average completion days")
    void getCourseRetention_ComputesMetrics() {
        when(courseRepository.findById(100L)).thenReturn(Optional.of(course));
        when(enrollmentRepository.countByCourseId(100L)).thenReturn(2L);
        when(lessonRepository.findByCourseIdOrderBySortOrderAscDayNumberAsc(100L)).thenReturn(List.of(lesson1, lesson2));

        Instant enrolledAt = Instant.now().minus(5, ChronoUnit.DAYS);
        Enrollment enr1 = Enrollment.builder().id(1L).user(student1).course(course).enrolledAt(enrolledAt).build();
        Enrollment enr2 = Enrollment.builder().id(2L).user(student2).course(course).enrolledAt(enrolledAt).build();
        when(enrollmentRepository.findAllByCourseIdWithUser(100L)).thenReturn(List.of(enr1, enr2));

        LessonProgress lp1 = LessonProgress.builder()
                .id(1L)
                .user(student1)
                .lesson(lesson1)
                .completedAt(enrolledAt.plus(1, ChronoUnit.DAYS))
                .build();
        LessonProgress lp2 = LessonProgress.builder()
                .id(2L)
                .user(student1)
                .lesson(lesson2)
                .completedAt(enrolledAt.plus(3, ChronoUnit.DAYS))
                .build();

        when(lessonProgressRepository.findAllByCourseIdWithUserAndLesson(100L)).thenReturn(List.of(lp1, lp2));
        when(lessonProgressRepository.countCompletedLessonsByUserIdAndCourseId(1L, 100L)).thenReturn(2L);
        when(lessonProgressRepository.countCompletedLessonsByUserIdAndCourseId(2L, 100L)).thenReturn(0L);

        CourseRetentionDto retention = adminAnalyticsService.getCourseRetention(100L);

        assertThat(retention).isNotNull();
        assertThat(retention.getCourseId()).isEqualTo(100L);
        assertThat(retention.getTotalEnrolled()).isEqualTo(2);
        assertThat(retention.getCompletedCount()).isEqualTo(1);
        assertThat(retention.getOverallCompletionRate()).isEqualTo(50.0);
        assertThat(retention.getLessonRetention()).hasSize(2);

        LessonRetentionDto l1 = retention.getLessonRetention().get(0);
        assertThat(l1.getLessonId()).isEqualTo(10L);
        assertThat(l1.getCompletedCount()).isEqualTo(1);
        assertThat(l1.getCompletionRate()).isEqualTo(50.0);
        assertThat(l1.getAvgDaysToComplete()).isEqualTo(1.0);

        LessonRetentionDto l2 = retention.getLessonRetention().get(1);
        assertThat(l2.getLessonId()).isEqualTo(11L);
        assertThat(l2.getCompletedCount()).isEqualTo(1);
        assertThat(l2.getCompletionRate()).isEqualTo(50.0);
        assertThat(l2.getAvgDaysToComplete()).isEqualTo(3.0);
    }

    @Test
    @DisplayName("getAiTutorSummary should aggregate AI questions, tokens and top lesson topics")
    void getAiTutorSummary_AggregatesCorrectly() {
        AuditLog log1 = AuditLog.builder()
                .id(1L)
                .user(student1)
                .action("AI_TUTOR_QUERY")
                .entityType("Lesson")
                .entityId(10L)
                .createdAt(Instant.now())
                .build();

        AuditLog log2 = AuditLog.builder()
                .id(2L)
                .user(student1)
                .action("AI_TUTOR_QUERY")
                .entityType("Lesson")
                .entityId(10L)
                .createdAt(Instant.now())
                .build();

        AuditLog log3 = AuditLog.builder()
                .id(3L)
                .user(student2)
                .action("AI_TUTOR_QUERY")
                .entityType("Lesson")
                .entityId(11L)
                .createdAt(Instant.now())
                .build();

        AuditLog rateLog = AuditLog.builder()
                .id(4L)
                .user(student2)
                .action("RATE_LIMIT_EXCEEDED")
                .createdAt(Instant.now())
                .build();

        when(auditLogRepository.findByAction("AI_TUTOR_QUERY")).thenReturn(List.of(log1, log2, log3));
        when(auditLogRepository.findByActionIn(anyList())).thenReturn(List.of(rateLog));
        when(lessonRepository.findAllById(any())).thenReturn(List.of(lesson1, lesson2));

        AiTutorTelemetryDto summary = adminAnalyticsService.getAiTutorSummary();

        assertThat(summary).isNotNull();
        assertThat(summary.getTotalQuestions()).isEqualTo(3);
        assertThat(summary.getThrottledCount()).isEqualTo(1);
        assertThat(summary.getActiveUsersCount()).isEqualTo(2);
        assertThat(summary.getEstimatedTokensUsed()).isEqualTo(3 * 340L);
        assertThat(summary.getAvgQuestionsPerUser()).isEqualTo(1.5);
        assertThat(summary.getTopLessonTopics()).hasSize(2);

        AiTutorTopicDto topTopic = summary.getTopLessonTopics().get(0);
        assertThat(topTopic.getLessonId()).isEqualTo(10L);
        assertThat(topTopic.getQuestionCount()).isEqualTo(2);
        assertThat(topTopic.getPercentage()).isEqualTo(66.7);
    }

    @Test
    @DisplayName("getQuizHotspots should identify failed questions and most common wrong options")
    void getQuizHotspots_CalculatesFailuresAndWrongOptions() {
        QuizQuestionOption opt1 = QuizQuestionOption.builder().id(101L).optionText("Option A (Wrong)").isCorrect(false).build();
        QuizQuestionOption opt2 = QuizQuestionOption.builder().id(102L).optionText("Option B (Correct)").isCorrect(true).build();
        QuizQuestionOption opt3 = QuizQuestionOption.builder().id(103L).optionText("Option C (Wrong)").isCorrect(false).build();

        QuizQuestion q1 = QuizQuestion.builder()
                .id(201L)
                .questionText("What is Spring Boot?")
                .options(List.of(opt1, opt2, opt3))
                .build();

        Quiz quiz = Quiz.builder()
                .id(301L)
                .title("Architecture Quiz")
                .lesson(lesson1)
                .questions(List.of(q1))
                .build();
        q1.setQuiz(quiz);

        // Student 1 selected wrong option 101
        QuizSubmission sub1 = QuizSubmission.builder()
                .id(1L)
                .quiz(quiz)
                .user(student1)
                .scorePercentage(0)
                .passed(false)
                .answersPayload("{\"201\": [101]}")
                .build();

        // Student 2 selected wrong option 101
        QuizSubmission sub2 = QuizSubmission.builder()
                .id(2L)
                .quiz(quiz)
                .user(student2)
                .scorePercentage(0)
                .passed(false)
                .answersPayload("{\"201\": [101]}")
                .build();

        when(quizRepository.findAll()).thenReturn(List.of(quiz));
        when(quizSubmissionRepository.findAll()).thenReturn(List.of(sub1, sub2));

        List<QuizHotspotDto> hotspots = adminAnalyticsService.getQuizHotspots();

        assertThat(hotspots).hasSize(1);
        QuizHotspotDto hotspot = hotspots.get(0);
        assertThat(hotspot.getQuestionId()).isEqualTo(201L);
        assertThat(hotspot.getQuestionText()).isEqualTo("What is Spring Boot?");
        assertThat(hotspot.getTotalAttempts()).isEqualTo(2);
        assertThat(hotspot.getFailureCount()).isEqualTo(2);
        assertThat(hotspot.getFailureRate()).isEqualTo(100.0);
        assertThat(hotspot.getPassRate()).isEqualTo(0.0);
        assertThat(hotspot.getMostCommonWrongOption()).isEqualTo("Option A (Wrong)");
    }

    @Test
    @DisplayName("exportAnalyticsJson and exportAnalyticsCsv should generate valid exportable structures")
    void exportAnalytics_ReturnsValidExportData() {
        when(userRepository.findAll()).thenReturn(List.of(student1, student2));
        when(enrollmentRepository.count()).thenReturn(2L);
        when(lessonProgressRepository.count()).thenReturn(2L);
        when(courseRepository.findAll()).thenReturn(List.of(course));
        when(courseRepository.findById(100L)).thenReturn(Optional.of(course));
        when(enrollmentRepository.countByCourseId(100L)).thenReturn(2L);
        when(lessonRepository.findByCourseIdOrderBySortOrderAscDayNumberAsc(100L)).thenReturn(List.of(lesson1));
        when(enrollmentRepository.findAllWithCourseAndUser()).thenReturn(List.of());
        when(enrollmentRepository.findAllByCourseIdWithUser(100L)).thenReturn(List.of());
        when(lessonProgressRepository.findAllByCourseIdWithUserAndLesson(100L)).thenReturn(List.of());
        when(lessonRepository.countLessonsByCourseIds(any())).thenReturn(List.of());
        when(lessonProgressRepository.countCompletedUsersByLessonIds(any())).thenReturn(List.of());
        when(auditLogRepository.findByAction("AI_TUTOR_QUERY")).thenReturn(List.of());
        when(auditLogRepository.findByActionIn(anyList())).thenReturn(List.of());
        when(quizRepository.findAll()).thenReturn(List.of());
        when(quizSubmissionRepository.findAll()).thenReturn(List.of());

        AdminAnalyticsExportDto exportJson = adminAnalyticsService.exportAnalyticsJson(100L);
        assertThat(exportJson).isNotNull();
        assertThat(exportJson.getCourseTitle()).isEqualTo("Full-Stack Course");
        assertThat(exportJson.getOverview()).isNotNull();

        String exportCsv = adminAnalyticsService.exportAnalyticsCsv(100L);
        assertThat(exportCsv).isNotNull();
        assertThat(exportCsv).contains("=== 1. PLATFORM OVERVIEW KPIS ===");
        assertThat(exportCsv).contains("=== 2. COURSE FUNNEL DROP-OFF ===");
        assertThat(exportCsv).contains("=== 3. LESSON RETENTION MATRIX ===");
        assertThat(exportCsv).contains("=== 4. STREAK DISTRIBUTION ===");
        assertThat(exportCsv).contains("=== 5. AI TUTOR TELEMETRY ===");
        assertThat(exportCsv).contains("=== 6. QUIZ FAILURE HOTSPOTS ===");
    }
}
