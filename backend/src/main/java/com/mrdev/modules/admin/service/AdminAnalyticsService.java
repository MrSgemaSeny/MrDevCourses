package com.mrdev.modules.admin.service;

import com.fasterxml.jackson.core.type.TypeReference;
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
import com.mrdev.modules.homework.model.SubmissionStatus;
import com.mrdev.modules.homework.repository.HomeworkSubmissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminAnalyticsService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final HomeworkSubmissionRepository homeworkSubmissionRepository;
    private final AuditLogRepository auditLogRepository;
    private final QuizRepository quizRepository;
    private final QuizSubmissionRepository quizSubmissionRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public AdminOverviewMetricsDto getOverviewMetrics() {
        List<User> allUsers = userRepository.findAll();
        List<User> students = allUsers.stream()
                .filter(u -> u.getRole() == Role.STUDENT)
                .toList();

        long totalStudents = students.size();
        if (totalStudents == 0 && !allUsers.isEmpty()) {
            totalStudents = allUsers.size();
            students = allUsers;
        }

        long totalEnrollments = enrollmentRepository.count();
        long totalLessonsCompleted = lessonProgressRepository.count();

        List<Enrollment> enrollments = enrollmentRepository.findAllWithCourseAndUser();
        List<Course> allCourses = courseRepository.findAll();

        Map<Long, Long> lessonCountsByCourse;
        if (allCourses.isEmpty()) {
            lessonCountsByCourse = Map.of();
        } else {
            List<Long> courseIds = allCourses.stream().map(Course::getId).toList();
            lessonCountsByCourse = lessonRepository.countLessonsByCourseIds(courseIds).stream()
                    .collect(Collectors.toMap(r -> (Long) r[0], r -> (Long) r[1]));
        }

        long totalCompletions = 0;
        for (Enrollment enrollment : enrollments) {
            Long courseId = enrollment.getCourse().getId();
            long totalLessons = lessonCountsByCourse.getOrDefault(courseId, 0L);
            if (totalLessons > 0) {
                long completed = lessonProgressRepository.countCompletedLessonsByUserIdAndCourseId(
                        enrollment.getUser().getId(),
                        courseId
                );
                if (completed >= totalLessons) {
                    totalCompletions++;
                }
            }
        }

        LocalDate sevenDaysAgo = LocalDate.now().minusDays(7);
        long activeStudents = students.stream()
                .filter(u -> u.getLastActiveDate() != null && !u.getLastActiveDate().isBefore(sevenDaysAgo))
                .count();

        double completionRate = totalEnrollments > 0
                ? Math.round(((double) totalCompletions / totalEnrollments) * 100.0 * 10.0) / 10.0
                : 0.0;

        return AdminOverviewMetricsDto.builder()
                .totalStudents(totalStudents)
                .totalEnrollments(totalEnrollments)
                .totalCompletions(totalCompletions)
                .totalLessonsCompleted(totalLessonsCompleted)
                .activeStudents(activeStudents)
                .completionRate(completionRate)
                .build();
    }

    @Transactional(readOnly = true)
    public List<CourseFunnelStepDto> getCourseFunnel(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));

        long totalEnrolled = enrollmentRepository.countByCourseId(courseId);
        List<Lesson> lessons = lessonRepository.findByCourseIdOrderBySortOrderAscDayNumberAsc(courseId);

        List<CourseFunnelStepDto> funnel = new ArrayList<>();

        // Step 0: Enrolled
        funnel.add(CourseFunnelStepDto.builder()
                .stepOrder(0)
                .stepName("Зачислено на курс")
                .dayNumber(null)
                .lessonId(null)
                .lessonTitle(null)
                .studentsCount(totalEnrolled)
                .conversionRate(totalEnrolled > 0 ? 100.0 : 0.0)
                .dropOffRate(0.0)
                .build());

        if (lessons.isEmpty()) {
            return funnel;
        }

        List<Long> lessonIds = lessons.stream().map(Lesson::getId).toList();
        Map<Long, Long> completedMap = lessonProgressRepository.countCompletedUsersByLessonIds(lessonIds).stream()
                .collect(Collectors.toMap(r -> (Long) r[0], r -> (Long) r[1]));

        long prevCount = totalEnrolled;
        for (int i = 0; i < lessons.size(); i++) {
            Lesson lesson = lessons.get(i);
            long completed = completedMap.getOrDefault(lesson.getId(), 0L);
            double conversionRate = totalEnrolled > 0
                    ? Math.round(((double) completed / totalEnrolled) * 100.0 * 10.0) / 10.0
                    : 0.0;
            double dropOffRate = (prevCount > 0 && prevCount > completed)
                    ? Math.round(((double) (prevCount - completed) / prevCount) * 100.0 * 10.0) / 10.0
                    : 0.0;

            long hwSubmissions = homeworkSubmissionRepository.countByLessonId(lesson.getId());
            long hwRejections = homeworkSubmissionRepository.countByLessonIdAndStatus(lesson.getId(), SubmissionStatus.NEEDS_IMPROVEMENT)
                    + homeworkSubmissionRepository.countByLessonIdAndStatus(lesson.getId(), SubmissionStatus.FAILED);
            boolean isBottleneck = dropOffRate >= 20.0 || (hwSubmissions > 0 && ((double) hwRejections / hwSubmissions) >= 0.3);

            funnel.add(CourseFunnelStepDto.builder()
                    .stepOrder(i + 1)
                    .stepName("День " + lesson.getDayNumber() + ": " + lesson.getTitle())
                    .dayNumber(lesson.getDayNumber())
                    .lessonId(lesson.getId())
                    .lessonTitle(lesson.getTitle())
                    .studentsCount(completed)
                    .conversionRate(conversionRate)
                    .dropOffRate(dropOffRate)
                    .hwSubmissionsCount(hwSubmissions)
                    .hwRejectionsCount(hwRejections)
                    .isBottleneck(isBottleneck)
                    .build());

            prevCount = completed;
        }

        // Final Step: Course Completed
        long completedAll = 0;
        List<Enrollment> enrollments = enrollmentRepository.findAllByCourseIdWithUser(courseId);
        for (Enrollment enr : enrollments) {
            long userCompleted = lessonProgressRepository.countCompletedLessonsByUserIdAndCourseId(
                    enr.getUser().getId(),
                    courseId
            );
            if (userCompleted >= lessons.size()) {
                completedAll++;
            }
        }

        double finalConversion = totalEnrolled > 0
                ? Math.round(((double) completedAll / totalEnrolled) * 100.0 * 10.0) / 10.0
                : 0.0;
        double finalDropOff = (prevCount > 0 && prevCount > completedAll)
                ? Math.round(((double) (prevCount - completedAll) / prevCount) * 100.0 * 10.0) / 10.0
                : 0.0;

        funnel.add(CourseFunnelStepDto.builder()
                .stepOrder(lessons.size() + 1)
                .stepName("Курс завершен (100%)")
                .dayNumber(null)
                .lessonId(null)
                .lessonTitle(null)
                .studentsCount(completedAll)
                .conversionRate(finalConversion)
                .dropOffRate(finalDropOff)
                .build());

        return funnel;
    }

    @Transactional(readOnly = true)
    public CourseRetentionDto getCourseRetention(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));

        long totalEnrolled = enrollmentRepository.countByCourseId(courseId);
        List<Lesson> lessons = lessonRepository.findByCourseIdOrderBySortOrderAscDayNumberAsc(courseId);
        List<Enrollment> enrollments = enrollmentRepository.findAllByCourseIdWithUser(courseId);

        Map<Long, Instant> userEnrolledAtMap = enrollments.stream()
                .collect(Collectors.toMap(e -> e.getUser().getId(), Enrollment::getEnrolledAt, (a, b) -> a));

        List<LessonProgress> allProgress = lessonProgressRepository.findAllByCourseIdWithUserAndLesson(courseId);
        Map<Long, List<LessonProgress>> progressByLesson = allProgress.stream()
                .collect(Collectors.groupingBy(lp -> lp.getLesson().getId()));

        List<LessonRetentionDto> lessonRetentionList = new ArrayList<>();
        long prevCompleted = totalEnrolled;

        for (Lesson lesson : lessons) {
            List<LessonProgress> lpList = progressByLesson.getOrDefault(lesson.getId(), List.of());
            long completedCount = lpList.size();

            double completionRate = totalEnrolled > 0
                    ? Math.round(((double) completedCount / totalEnrolled) * 100.0 * 10.0) / 10.0
                    : 0.0;

            double dropOffRate = (prevCompleted > 0 && prevCompleted > completedCount)
                    ? Math.round(((double) (prevCompleted - completedCount) / prevCompleted) * 100.0 * 10.0) / 10.0
                    : 0.0;

            double avgDays = lpList.stream()
                    .mapToDouble(lp -> {
                        Instant enrolledAt = userEnrolledAtMap.get(lp.getUser().getId());
                        if (enrolledAt != null && lp.getCompletedAt() != null) {
                            long millis = Math.max(0, Duration.between(enrolledAt, lp.getCompletedAt()).toMillis());
                            return (double) millis / (1000.0 * 60 * 60 * 24);
                        }
                        return 0.0;
                    })
                    .average()
                    .orElse(0.0);
            avgDays = Math.round(avgDays * 10.0) / 10.0;

            lessonRetentionList.add(LessonRetentionDto.builder()
                    .lessonId(lesson.getId())
                    .dayNumber(lesson.getDayNumber())
                    .lessonTitle(lesson.getTitle())
                    .completedCount(completedCount)
                    .completionRate(completionRate)
                    .dropOffRate(dropOffRate)
                    .avgDaysToComplete(avgDays)
                    .build());

            prevCompleted = completedCount;
        }

        long completedAll = 0;
        for (Enrollment enr : enrollments) {
            long userCompleted = lessonProgressRepository.countCompletedLessonsByUserIdAndCourseId(
                    enr.getUser().getId(),
                    courseId
            );
            if (!lessons.isEmpty() && userCompleted >= lessons.size()) {
                completedAll++;
            }
        }

        double overallCompletionRate = totalEnrolled > 0
                ? Math.round(((double) completedAll / totalEnrolled) * 100.0 * 10.0) / 10.0
                : 0.0;

        return CourseRetentionDto.builder()
                .courseId(course.getId())
                .courseTitle(course.getTitle())
                .totalEnrolled(totalEnrolled)
                .completedCount(completedAll)
                .overallCompletionRate(overallCompletionRate)
                .lessonRetention(lessonRetentionList)
                .build();
    }

    @Transactional(readOnly = true)
    public AiTutorTelemetryDto getAiTutorSummary() {
        List<AuditLog> aiLogs = auditLogRepository.findByAction("AI_TUTOR_QUERY");
        List<AuditLog> rateLimitLogs = auditLogRepository.findByActionIn(List.of("RATE_LIMIT_EXCEEDED", "AI_TUTOR_RATE_LIMIT", "AI_RATE_LIMIT"));

        long totalQuestions = aiLogs.size();
        long throttledCount = rateLimitLogs.size();
        long estimatedTokensUsed = totalQuestions * 340L;

        long activeUsersCount = aiLogs.stream()
                .filter(log -> log.getUser() != null)
                .map(log -> log.getUser().getId())
                .distinct()
                .count();

        double avgQuestionsPerUser = activeUsersCount > 0
                ? Math.round(((double) totalQuestions / activeUsersCount) * 10.0) / 10.0
                : 0.0;

        Map<Long, Long> questionsPerLesson = aiLogs.stream()
                .filter(log -> log.getEntityId() != null && "Lesson".equalsIgnoreCase(log.getEntityType()))
                .collect(Collectors.groupingBy(AuditLog::getEntityId, Collectors.counting()));

        List<AiTutorTopicDto> topLessonTopics = new ArrayList<>();
        if (!questionsPerLesson.isEmpty()) {
            List<Lesson> lessons = lessonRepository.findAllById(questionsPerLesson.keySet());
            Map<Long, Lesson> lessonMap = lessons.stream().collect(Collectors.toMap(Lesson::getId, l -> l));

            topLessonTopics = questionsPerLesson.entrySet().stream()
                    .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                    .limit(10)
                    .map(entry -> {
                        Lesson lesson = lessonMap.get(entry.getKey());
                        String lessonTitle = lesson != null ? lesson.getTitle() : "Урок #" + entry.getKey();
                        String courseTitle = (lesson != null && lesson.getCourse() != null) ? lesson.getCourse().getTitle() : "Не указан";
                        double percentage = totalQuestions > 0
                                ? Math.round(((double) entry.getValue() / totalQuestions) * 100.0 * 10.0) / 10.0
                                : 0.0;

                        return AiTutorTopicDto.builder()
                                .lessonId(entry.getKey())
                                .lessonTitle(lessonTitle)
                                .courseTitle(courseTitle)
                                .questionCount(entry.getValue())
                                .percentage(percentage)
                                .build();
                    })
                    .collect(Collectors.toList());
        }

        return AiTutorTelemetryDto.builder()
                .totalQuestions(totalQuestions)
                .estimatedTokensUsed(estimatedTokensUsed)
                .throttledCount(throttledCount)
                .activeUsersCount(activeUsersCount)
                .avgQuestionsPerUser(avgQuestionsPerUser)
                .topLessonTopics(topLessonTopics)
                .build();
    }

    @Transactional(readOnly = true)
    public List<QuizHotspotDto> getQuizHotspots() {
        List<QuizSubmission> submissions = quizSubmissionRepository.findAll();
        List<Quiz> allQuizzes = quizRepository.findAll();

        if (allQuizzes.isEmpty()) {
            return List.of();
        }

        Map<Long, QuizQuestion> questionMap = new HashMap<>();
        for (Quiz quiz : allQuizzes) {
            if (quiz.getQuestions() != null) {
                for (QuizQuestion q : quiz.getQuestions()) {
                    questionMap.put(q.getId(), q);
                }
            }
        }

        if (questionMap.isEmpty()) {
            return List.of();
        }

        Map<Long, Long> questionAttempts = new HashMap<>();
        Map<Long, Long> questionFailures = new HashMap<>();
        Map<Long, Map<Long, Long>> questionWrongOptionCounts = new HashMap<>();

        for (QuizSubmission sub : submissions) {
            String payload = sub.getAnswersPayload();
            if (payload == null || payload.isBlank()) {
                continue;
            }

            try {
                Map<String, Object> rawAnswers = objectMapper.readValue(payload, new TypeReference<Map<String, Object>>() {});
                for (Map.Entry<String, Object> entry : rawAnswers.entrySet()) {
                    Long qId;
                    try {
                        qId = Long.parseLong(entry.getKey());
                    } catch (NumberFormatException e) {
                        continue;
                    }

                    QuizQuestion question = questionMap.get(qId);
                    if (question == null) {
                        continue;
                    }

                    List<Long> selectedOptionIds = new ArrayList<>();
                    if (entry.getValue() instanceof List<?> list) {
                        for (Object item : list) {
                            if (item instanceof Number num) {
                                selectedOptionIds.add(num.longValue());
                            }
                        }
                    }

                    questionAttempts.merge(qId, 1L, Long::sum);

                    Set<Long> correctOptionIds = question.getOptions().stream()
                            .filter(QuizQuestionOption::getIsCorrect)
                            .map(QuizQuestionOption::getId)
                            .collect(Collectors.toSet());

                    Set<Long> userSelectedSet = new HashSet<>(selectedOptionIds);
                    boolean isCorrect = !correctOptionIds.isEmpty() && correctOptionIds.equals(userSelectedSet);

                    if (!isCorrect) {
                        questionFailures.merge(qId, 1L, Long::sum);

                        Map<Long, Long> wrongOptionCounts = questionWrongOptionCounts.computeIfAbsent(qId, k -> new HashMap<>());
                        for (Long optId : selectedOptionIds) {
                            if (!correctOptionIds.contains(optId)) {
                                wrongOptionCounts.merge(optId, 1L, Long::sum);
                            }
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to parse quiz answers payload for submission {}", sub.getId(), e);
            }
        }

        List<QuizHotspotDto> hotspots = new ArrayList<>();

        for (Map.Entry<Long, QuizQuestion> entry : questionMap.entrySet()) {
            Long qId = entry.getKey();
            QuizQuestion q = entry.getValue();
            Quiz quiz = q.getQuiz();

            long attempts = questionAttempts.getOrDefault(qId, 0L);
            long failures = questionFailures.getOrDefault(qId, 0L);

            double failureRate = attempts > 0
                    ? Math.round(((double) failures / attempts) * 100.0 * 10.0) / 10.0
                    : 0.0;
            double passRate = attempts > 0
                    ? Math.round((100.0 - failureRate) * 10.0) / 10.0
                    : 100.0;

            String mostCommonWrongOption = "—";
            Map<Long, Long> wrongCounts = questionWrongOptionCounts.get(qId);
            if (wrongCounts != null && !wrongCounts.isEmpty()) {
                Long topWrongOptId = wrongCounts.entrySet().stream()
                        .max(Map.Entry.comparingByValue())
                        .map(Map.Entry::getKey)
                        .orElse(null);

                if (topWrongOptId != null) {
                    mostCommonWrongOption = q.getOptions().stream()
                            .filter(opt -> opt.getId().equals(topWrongOptId))
                            .map(QuizQuestionOption::getOptionText)
                            .findFirst()
                            .orElse("Опция #" + topWrongOptId);
                }
            }

            String lessonTitle = (quiz != null && quiz.getLesson() != null) ? quiz.getLesson().getTitle() : "—";
            String courseTitle = (quiz != null && quiz.getLesson() != null && quiz.getLesson().getCourse() != null)
                    ? quiz.getLesson().getCourse().getTitle()
                    : "—";

            hotspots.add(QuizHotspotDto.builder()
                    .questionId(qId)
                    .questionText(q.getQuestionText())
                    .quizId(quiz != null ? quiz.getId() : null)
                    .quizTitle(quiz != null ? quiz.getTitle() : "—")
                    .lessonTitle(lessonTitle)
                    .courseTitle(courseTitle)
                    .totalAttempts(attempts)
                    .failureCount(failures)
                    .failureRate(failureRate)
                    .passRate(passRate)
                    .mostCommonWrongOption(mostCommonWrongOption)
                    .build());
        }

        hotspots.sort(Comparator
                .comparingDouble(QuizHotspotDto::getFailureRate).reversed()
                .thenComparingLong(QuizHotspotDto::getFailureCount).reversed());

        return hotspots.stream().limit(15).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AdminAnalyticsExportDto exportAnalyticsJson(Long courseId) {
        AdminOverviewMetricsDto overview = getOverviewMetrics();
        AiTutorTelemetryDto aiTutor = getAiTutorSummary();
        List<QuizHotspotDto> quizHotspots = getQuizHotspots();

        List<CourseFunnelStepDto> funnel = List.of();
        CourseRetentionDto retention = null;
        String courseTitle = "Все курсы платформы";

        if (courseId != null) {
            Course course = courseRepository.findById(courseId).orElse(null);
            if (course != null) {
                courseTitle = course.getTitle();
                funnel = getCourseFunnel(courseId);
                retention = getCourseRetention(courseId);
            }
        } else {
            List<Course> courses = courseRepository.findAll();
            if (!courses.isEmpty()) {
                Long firstCourseId = courses.get(0).getId();
                courseTitle = courses.get(0).getTitle();
                funnel = getCourseFunnel(firstCourseId);
                retention = getCourseRetention(firstCourseId);
            }
        }

        return AdminAnalyticsExportDto.builder()
                .exportedAt(Instant.now())
                .courseId(courseId)
                .courseTitle(courseTitle)
                .overview(overview)
                .funnel(funnel)
                .retention(retention)
                .aiTutorSummary(aiTutor)
                .quizHotspots(quizHotspots)
                .build();
    }

    @Transactional(readOnly = true)
    public String exportAnalyticsCsv(Long courseId) {
        AdminAnalyticsExportDto data = exportAnalyticsJson(courseId);
        StringBuilder sb = new StringBuilder();

        sb.append("# MrDeveloper Platform Telemetry & Analytics Report\n");
        sb.append("# Generated UTC: ").append(data.getExportedAt()).append("\n");
        sb.append("# Scope Course: ").append(escapeCsv(data.getCourseTitle())).append("\n\n");

        // Section 1: Overview KPIs
        sb.append("=== 1. PLATFORM OVERVIEW KPIS ===\n");
        sb.append("Metric,Value\n");
        sb.append("Total Students,").append(data.getOverview().getTotalStudents()).append("\n");
        sb.append("Total Enrollments,").append(data.getOverview().getTotalEnrollments()).append("\n");
        sb.append("Total Course Completions,").append(data.getOverview().getTotalCompletions()).append("\n");
        sb.append("Total Lessons Completed,").append(data.getOverview().getTotalLessonsCompleted()).append("\n");
        sb.append("Active Students (7d),").append(data.getOverview().getActiveStudents()).append("\n");
        sb.append("Overall Completion Rate (%),").append(data.getOverview().getCompletionRate()).append("%\n\n");

        // Section 2: Course Funnel
        sb.append("=== 2. COURSE FUNNEL DROP-OFF ===\n");
        sb.append("Step,Step Name,Students Count,Conversion Rate (%),Drop-off Rate (%)\n");
        if (data.getFunnel() != null) {
            for (CourseFunnelStepDto step : data.getFunnel()) {
                sb.append(step.getStepOrder()).append(",")
                        .append(escapeCsv(step.getStepName())).append(",")
                        .append(step.getStudentsCount()).append(",")
                        .append(step.getConversionRate()).append("%,")
                        .append(step.getDropOffRate()).append("%\n");
            }
        }
        sb.append("\n");

        // Section 3: Lesson Retention Matrix
        sb.append("=== 3. LESSON RETENTION MATRIX ===\n");
        sb.append("Day,Lesson Title,Completed Count,Completion Rate (%),Drop-off Rate (%),Avg Days To Complete\n");
        if (data.getRetention() != null && data.getRetention().getLessonRetention() != null) {
            for (LessonRetentionDto lr : data.getRetention().getLessonRetention()) {
                sb.append("Day ").append(lr.getDayNumber()).append(",")
                        .append(escapeCsv(lr.getLessonTitle())).append(",")
                        .append(lr.getCompletedCount()).append(",")
                        .append(lr.getCompletionRate()).append("%,")
                        .append(lr.getDropOffRate()).append("%,")
                        .append(lr.getAvgDaysToComplete()).append("\n");
            }
        }
        sb.append("\n");

        // Section 4: AI Tutor Telemetry
        sb.append("=== 4. AI TUTOR TELEMETRY ===\n");
        sb.append("Metric,Value\n");
        if (data.getAiTutorSummary() != null) {
            sb.append("Total AI Tutor Questions,").append(data.getAiTutorSummary().getTotalQuestions()).append("\n");
            sb.append("Estimated Tokens Used,").append(data.getAiTutorSummary().getEstimatedTokensUsed()).append("\n");
            sb.append("Throttled Requests (Rate Limit),").append(data.getAiTutorSummary().getThrottledCount()).append("\n");
            sb.append("Active Users Asking AI,").append(data.getAiTutorSummary().getActiveUsersCount()).append("\n");
            sb.append("Avg Questions Per User,").append(data.getAiTutorSummary().getAvgQuestionsPerUser()).append("\n");
        }
        sb.append("\n");

        // Section 5: Quiz Hotspots
        sb.append("=== 5. QUIZ FAILURE HOTSPOTS ===\n");
        sb.append("Question Text,Quiz Title,Course,Total Attempts,Failures,Failure Rate (%),Pass Rate (%),Common Wrong Option\n");
        if (data.getQuizHotspots() != null) {
            for (QuizHotspotDto qh : data.getQuizHotspots()) {
                sb.append(escapeCsv(qh.getQuestionText())).append(",")
                        .append(escapeCsv(qh.getQuizTitle())).append(",")
                        .append(escapeCsv(qh.getCourseTitle())).append(",")
                        .append(qh.getTotalAttempts()).append(",")
                        .append(qh.getFailureCount()).append(",")
                        .append(qh.getFailureRate()).append("%,")
                        .append(qh.getPassRate()).append("%,")
                        .append(escapeCsv(qh.getMostCommonWrongOption())).append("\n");
            }
        }

        return sb.toString();
    }

    private String escapeCsv(String value) {
        if (value == null) {
            return "\"\"";
        }
        String escaped = value.replace("\"", "\"\"");
        return "\"" + escaped + "\"";
    }
}
