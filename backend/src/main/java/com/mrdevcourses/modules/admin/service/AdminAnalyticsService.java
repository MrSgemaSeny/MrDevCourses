package com.mrdevcourses.modules.admin.service;

import com.mrdevcourses.common.exception.ResourceNotFoundException;
import com.mrdevcourses.modules.admin.dto.AdminOverviewMetricsDto;
import com.mrdevcourses.modules.admin.dto.CourseFunnelStepDto;
import com.mrdevcourses.modules.admin.dto.CourseRetentionDto;
import com.mrdevcourses.modules.admin.dto.LessonRetentionDto;
import com.mrdevcourses.modules.admin.dto.StreakDistributionDto;
import com.mrdevcourses.modules.auth.model.Role;
import com.mrdevcourses.modules.auth.model.User;
import com.mrdevcourses.modules.auth.repository.UserRepository;
import com.mrdevcourses.modules.course.model.Course;
import com.mrdevcourses.modules.course.model.Enrollment;
import com.mrdevcourses.modules.course.repository.CourseRepository;
import com.mrdevcourses.modules.course.repository.EnrollmentRepository;
import com.mrdevcourses.modules.lesson.model.Lesson;
import com.mrdevcourses.modules.lesson.model.LessonProgress;
import com.mrdevcourses.modules.lesson.repository.LessonProgressRepository;
import com.mrdevcourses.modules.lesson.repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminAnalyticsService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LessonProgressRepository lessonProgressRepository;

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

        double averageStreak = students.stream()
                .mapToInt(User::getCurrentStreak)
                .average()
                .orElse(0.0);
        averageStreak = Math.round(averageStreak * 10.0) / 10.0;

        LocalDate sevenDaysAgo = LocalDate.now().minusDays(7);
        long activeStudents = students.stream()
                .filter(u -> u.getCurrentStreak() > 0 || (u.getLastActiveDate() != null && !u.getLastActiveDate().isBefore(sevenDaysAgo)))
                .count();

        double completionRate = totalEnrollments > 0
                ? Math.round(((double) totalCompletions / totalEnrollments) * 100.0 * 10.0) / 10.0
                : 0.0;

        return AdminOverviewMetricsDto.builder()
                .totalStudents(totalStudents)
                .totalEnrollments(totalEnrollments)
                .totalCompletions(totalCompletions)
                .totalLessonsCompleted(totalLessonsCompleted)
                .averageStreak(averageStreak)
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

            funnel.add(CourseFunnelStepDto.builder()
                    .stepOrder(i + 1)
                    .stepName("День " + lesson.getDayNumber() + ": " + lesson.getTitle())
                    .dayNumber(lesson.getDayNumber())
                    .lessonId(lesson.getId())
                    .lessonTitle(lesson.getTitle())
                    .studentsCount(completed)
                    .conversionRate(conversionRate)
                    .dropOffRate(dropOffRate)
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
    public List<StreakDistributionDto> getStreakDistribution() {
        List<User> allUsers = userRepository.findAll();
        List<User> students = allUsers.stream()
                .filter(u -> u.getRole() == Role.STUDENT)
                .toList();

        if (students.isEmpty() && !allUsers.isEmpty()) {
            students = allUsers;
        }

        long total = students.size();

        long count0 = students.stream().filter(u -> u.getCurrentStreak() == 0).count();
        long count1to3 = students.stream().filter(u -> u.getCurrentStreak() >= 1 && u.getCurrentStreak() <= 3).count();
        long count4to7 = students.stream().filter(u -> u.getCurrentStreak() >= 4 && u.getCurrentStreak() <= 7).count();
        long count8to14 = students.stream().filter(u -> u.getCurrentStreak() >= 8 && u.getCurrentStreak() <= 14).count();
        long count15plus = students.stream().filter(u -> u.getCurrentStreak() >= 15).count();

        return List.of(
                createStreakDto("0 дней", count0, total),
                createStreakDto("1-3 дня", count1to3, total),
                createStreakDto("4-7 дней", count4to7, total),
                createStreakDto("8-14 дней", count8to14, total),
                createStreakDto("15+ дней", count15plus, total)
        );
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

    private StreakDistributionDto createStreakDto(String range, long count, long total) {
        double percentage = total > 0
                ? Math.round(((double) count / total) * 100.0 * 10.0) / 10.0
                : 0.0;
        return StreakDistributionDto.builder()
                .range(range)
                .count(count)
                .percentage(percentage)
                .build();
    }
}
