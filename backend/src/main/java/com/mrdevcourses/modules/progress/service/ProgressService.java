package com.mrdevcourses.modules.progress.service;

import com.mrdevcourses.common.exception.ResourceNotFoundException;
import com.mrdevcourses.modules.course.model.Enrollment;
import com.mrdevcourses.modules.course.repository.EnrollmentRepository;
import com.mrdevcourses.modules.lesson.model.Lesson;
import com.mrdevcourses.modules.lesson.repository.LessonProgressRepository;
import com.mrdevcourses.modules.lesson.repository.LessonRepository;
import com.mrdevcourses.modules.lesson.service.LessonService;
import com.mrdevcourses.modules.progress.dto.CourseProgressDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProgressService {

    private final EnrollmentRepository enrollmentRepository;
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final LessonService lessonService;

    @Transactional(readOnly = true)
    public List<CourseProgressDto> getAllProgressForUser(Long userId) {
        List<Enrollment> enrollments = enrollmentRepository.findAllByUserIdWithCourse(userId);
        if (enrollments.isEmpty()) {
            return List.of();
        }

        List<Long> courseIds = enrollments.stream().map(e -> e.getCourse().getId()).toList();

        // Batch fetch lessons for all enrolled courses
        List<Lesson> allLessons = lessonRepository.findAllByCourseIdInOrderBySortOrderAscDayNumberAsc(courseIds);
        Map<Long, List<Lesson>> lessonsByCourse = allLessons.stream()
                .collect(Collectors.groupingBy(l -> l.getCourse().getId()));

        // Batch calculate completed lesson counts grouped by course
        Map<Long, Long> completedCounts = lessonProgressRepository.countCompletedLessonsByUserAndCourseIds(userId, courseIds).stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (Long) row[1]
                ));

        Instant now = Instant.now();

        return enrollments.stream()
                .map(enrollment -> {
                    Long courseId = enrollment.getCourse().getId();
                    Instant enrolledAt = enrollment.getEnrolledAt();
                    List<Lesson> lessons = lessonsByCourse.getOrDefault(courseId, List.of());
                    long totalLessons = lessons.size();
                    long completedCount = completedCounts.getOrDefault(courseId, 0L);

                    long daysPassed = Duration.between(enrolledAt, now).toDays();
                    int currentDay = (int) Math.max(1, daysPassed + 1);

                    long totalUnlocked = lessons.stream()
                            .filter(l -> !now.isBefore(lessonService.calculateUnlockTime(enrolledAt, l.getDayNumber())))
                            .count();

                    Instant nextUnlockAt = lessons.stream()
                            .map(l -> lessonService.calculateUnlockTime(enrolledAt, l.getDayNumber()))
                            .filter(unlockTime -> unlockTime.isAfter(now))
                            .min(Comparator.naturalOrder())
                            .orElse(null);

                    double progressPercentage = totalLessons > 0 ? ((double) completedCount / totalLessons) * 100.0 : 0.0;

                    return CourseProgressDto.builder()
                            .courseId(courseId)
                            .courseTitle(enrollment.getCourse().getTitle())
                            .courseDescription(enrollment.getCourse().getDescription())
                            .courseSlug(enrollment.getCourse().getSlug())
                            .enrolledAt(enrolledAt)
                            .currentDay(currentDay)
                            .completedCount(completedCount)
                            .totalUnlocked(totalUnlocked)
                            .totalLessons(totalLessons)
                            .progressPercentage(Math.round(progressPercentage * 10.0) / 10.0)
                            .nextUnlockAt(nextUnlockAt)
                            .build();
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public CourseProgressDto getProgressForCourse(Long userId, Long courseId) {
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment for user", "courseId", courseId));
        return calculateCourseProgress(enrollment);
    }

    private CourseProgressDto calculateCourseProgress(Enrollment enrollment) {
        Long courseId = enrollment.getCourse().getId();
        Long userId = enrollment.getUser().getId();
        Instant enrolledAt = enrollment.getEnrolledAt();
        Instant now = Instant.now();

        List<Lesson> lessons = lessonRepository.findByCourseIdOrderBySortOrderAscDayNumberAsc(courseId);
        long totalLessons = lessons.size();

        long completedCount = lessonProgressRepository.countCompletedLessonsByUserIdAndCourseId(userId, courseId);

        long daysPassed = Duration.between(enrolledAt, now).toDays();
        int currentDay = (int) Math.max(1, daysPassed + 1);

        long totalUnlocked = lessons.stream()
                .filter(l -> !now.isBefore(lessonService.calculateUnlockTime(enrolledAt, l.getDayNumber())))
                .count();

        Instant nextUnlockAt = lessons.stream()
                .map(l -> lessonService.calculateUnlockTime(enrolledAt, l.getDayNumber()))
                .filter(unlockTime -> unlockTime.isAfter(now))
                .min(Comparator.naturalOrder())
                .orElse(null);

        double progressPercentage = totalLessons > 0 ? ((double) completedCount / totalLessons) * 100.0 : 0.0;

        return CourseProgressDto.builder()
                .courseId(courseId)
                .courseTitle(enrollment.getCourse().getTitle())
                .courseDescription(enrollment.getCourse().getDescription())
                .courseSlug(enrollment.getCourse().getSlug())
                .enrolledAt(enrolledAt)
                .currentDay(currentDay)
                .completedCount(completedCount)
                .totalUnlocked(totalUnlocked)
                .totalLessons(totalLessons)
                .progressPercentage(Math.round(progressPercentage * 10.0) / 10.0)
                .nextUnlockAt(nextUnlockAt)
                .build();
    }
}
