package com.mrdevcourses.modules.lesson.service;

import com.mrdevcourses.common.exception.AccessDeniedException;
import com.mrdevcourses.common.exception.ApiException;
import com.mrdevcourses.common.exception.ResourceNotFoundException;
import com.mrdevcourses.modules.auth.model.Role;
import com.mrdevcourses.modules.auth.model.User;
import com.mrdevcourses.modules.auth.repository.UserRepository;
import com.mrdevcourses.modules.course.model.Course;
import com.mrdevcourses.modules.course.model.Enrollment;
import com.mrdevcourses.modules.course.repository.CourseRepository;
import com.mrdevcourses.modules.course.repository.EnrollmentRepository;
import com.mrdevcourses.modules.lesson.dto.LessonDetailDto;
import com.mrdevcourses.modules.lesson.dto.LessonSummaryDto;
import com.mrdevcourses.modules.lesson.model.Lesson;
import com.mrdevcourses.modules.lesson.model.LessonProgress;
import com.mrdevcourses.modules.lesson.repository.LessonProgressRepository;
import com.mrdevcourses.modules.lesson.repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LessonService {

    private final LessonRepository lessonRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<LessonSummaryDto> getLessonsForCourse(Long courseId, Long userId, Role userRole) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));

        List<Lesson> lessons = lessonRepository.findByCourseIdOrderBySortOrderAscDayNumberAsc(courseId);

        if (userRole == Role.ADMIN) {
            return lessons.stream()
                    .map(lesson -> LessonSummaryDto.builder()
                            .id(lesson.getId())
                            .courseId(course.getId())
                            .title(lesson.getTitle())
                            .dayNumber(lesson.getDayNumber())
                            .sortOrder(lesson.getSortOrder())
                            .accessible(true)
                            .opensAt(Instant.now())
                            .completed(false)
                            .completedAt(null)
                            .build())
                    .toList();
        }

        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new ApiException("Вы не записаны на этот курс", HttpStatus.FORBIDDEN));

        Map<Long, LessonProgress> progressMap = lessonProgressRepository.findAllByUserIdAndCourseId(userId, courseId)
                .stream()
                .collect(Collectors.toMap(lp -> lp.getLesson().getId(), lp -> lp));

        Instant now = Instant.now();
        Instant enrolledAt = enrollment.getEnrolledAt();

        return lessons.stream()
                .map(lesson -> {
                    Instant opensAt = calculateUnlockTime(enrolledAt, lesson.getDayNumber());
                    boolean isAccessible = !now.isBefore(opensAt);
                    LessonProgress progress = progressMap.get(lesson.getId());
                    boolean isCompleted = progress != null;
                    Instant completedAt = isCompleted ? progress.getCompletedAt() : null;

                    return LessonSummaryDto.builder()
                            .id(lesson.getId())
                            .courseId(course.getId())
                            .title(lesson.getTitle())
                            .dayNumber(lesson.getDayNumber())
                            .sortOrder(lesson.getSortOrder())
                            .accessible(isAccessible)
                            .opensAt(opensAt)
                            .completed(isCompleted)
                            .completedAt(completedAt)
                            .build();
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public LessonDetailDto getLessonDetail(Long courseId, Long lessonId, Long userId, Role userRole) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));

        Lesson lesson = lessonRepository.findByIdAndCourseId(lessonId, courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", lessonId));

        List<Lesson> allCourseLessons = lessonRepository.findByCourseIdOrderBySortOrderAscDayNumberAsc(courseId);
        Long prevLessonId = null;
        Long nextLessonId = null;
        for (int i = 0; i < allCourseLessons.size(); i++) {
            if (allCourseLessons.get(i).getId().equals(lessonId)) {
                if (i > 0) {
                    prevLessonId = allCourseLessons.get(i - 1).getId();
                }
                if (i < allCourseLessons.size() - 1) {
                    nextLessonId = allCourseLessons.get(i + 1).getId();
                }
                break;
            }
        }

        if (userRole == Role.ADMIN) {
            return LessonDetailDto.builder()
                    .id(lesson.getId())
                    .courseId(course.getId())
                    .courseTitle(course.getTitle())
                    .courseSlug(course.getSlug())
                    .title(lesson.getTitle())
                    .content(lesson.getContent())
                    .youtubeUrl(lesson.getYoutubeUrl())
                    .dayNumber(lesson.getDayNumber())
                    .sortOrder(lesson.getSortOrder())
                    .accessible(true)
                    .opensAt(Instant.now())
                    .completed(false)
                    .completedAt(null)
                    .prevLessonId(prevLessonId)
                    .nextLessonId(nextLessonId)
                    .build();
        }

        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new ApiException("Вы не записаны на этот курс", HttpStatus.FORBIDDEN));

        Instant enrolledAt = enrollment.getEnrolledAt();
        Instant opensAt = calculateUnlockTime(enrolledAt, lesson.getDayNumber());
        Instant now = Instant.now();

        if (now.isBefore(opensAt)) {
            throw new AccessDeniedException("Урок заблокирован. Он станет доступен: " + opensAt.toString());
        }

        Optional<LessonProgress> progressOpt = lessonProgressRepository.findByUserIdAndLessonId(userId, lessonId);
        boolean isCompleted = progressOpt.isPresent();
        Instant completedAt = isCompleted ? progressOpt.get().getCompletedAt() : null;

        return LessonDetailDto.builder()
                .id(lesson.getId())
                .courseId(course.getId())
                .courseTitle(course.getTitle())
                .courseSlug(course.getSlug())
                .title(lesson.getTitle())
                .content(lesson.getContent())
                .youtubeUrl(lesson.getYoutubeUrl())
                .dayNumber(lesson.getDayNumber())
                .sortOrder(lesson.getSortOrder())
                .accessible(true)
                .opensAt(opensAt)
                .completed(isCompleted)
                .completedAt(completedAt)
                .prevLessonId(prevLessonId)
                .nextLessonId(nextLessonId)
                .build();
    }

    @Transactional
    public LessonSummaryDto completeLesson(Long courseId, Long lessonId, Long userId, Role userRole) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));

        Lesson lesson = lessonRepository.findByIdAndCourseId(lessonId, courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", lessonId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (userRole != Role.ADMIN) {
            Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(userId, courseId)
                    .orElseThrow(() -> new ApiException("Вы не записаны на этот курс", HttpStatus.FORBIDDEN));

            Instant opensAt = calculateUnlockTime(enrollment.getEnrolledAt(), lesson.getDayNumber());
            if (Instant.now().isBefore(opensAt)) {
                throw new AccessDeniedException("Нельзя завершить заблокированный урок");
            }
        }

        Optional<LessonProgress> existingProgress = lessonProgressRepository.findByUserIdAndLessonId(userId, lessonId);
        LessonProgress progress;
        if (existingProgress.isPresent()) {
            progress = existingProgress.get();
        } else {
            progress = LessonProgress.builder()
                    .user(user)
                    .lesson(lesson)
                    .completedAt(Instant.now())
                    .build();
            progress = lessonProgressRepository.save(progress);
            log.info("User {} marked lesson {} ({}) as complete", userId, lessonId, lesson.getTitle());
        }

        Instant opensAt = Instant.now();
        return LessonSummaryDto.builder()
                .id(lesson.getId())
                .courseId(course.getId())
                .title(lesson.getTitle())
                .dayNumber(lesson.getDayNumber())
                .sortOrder(lesson.getSortOrder())
                .accessible(true)
                .opensAt(opensAt)
                .completed(true)
                .completedAt(progress.getCompletedAt())
                .build();
    }

    public Instant calculateUnlockTime(Instant enrolledAt, int dayNumber) {
        if (dayNumber <= 1) {
            return enrolledAt;
        }
        return enrolledAt.plus(Duration.ofDays(dayNumber - 1L));
    }
}
