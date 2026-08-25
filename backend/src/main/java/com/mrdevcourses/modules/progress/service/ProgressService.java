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
        return enrollments.stream()
                .map(this::calculateCourseProgress)
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
