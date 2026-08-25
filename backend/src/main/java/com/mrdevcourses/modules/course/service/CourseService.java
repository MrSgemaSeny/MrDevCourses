package com.mrdevcourses.modules.course.service;

import com.mrdevcourses.common.exception.ApiException;
import com.mrdevcourses.common.exception.ResourceNotFoundException;
import com.mrdevcourses.modules.audit.service.AuditService;
import com.mrdevcourses.modules.auth.model.User;
import com.mrdevcourses.modules.auth.repository.UserRepository;
import com.mrdevcourses.modules.course.dto.CourseDto;
import com.mrdevcourses.modules.course.dto.EnrollmentDto;
import com.mrdevcourses.modules.course.model.Course;
import com.mrdevcourses.modules.course.model.Enrollment;
import com.mrdevcourses.modules.course.repository.CourseRepository;
import com.mrdevcourses.modules.course.repository.EnrollmentRepository;
import com.mrdevcourses.modules.lesson.repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<CourseDto> getActiveCourses(Optional<Long> currentUserId) {
        List<Course> courses = courseRepository.findByActiveTrueOrderByCreatedAtDesc();
        if (courses.isEmpty()) {
            return List.of();
        }

        List<Long> courseIds = courses.stream().map(Course::getId).toList();

        // Batch fetch lesson counts for all active courses
        Map<Long, Long> lessonCountMap = lessonRepository.countLessonsByCourseIds(courseIds).stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (Long) row[1]
                ));

        // Batch fetch user enrollments if authenticated
        Map<Long, Instant> userEnrollmentMap;
        if (currentUserId.isPresent()) {
            userEnrollmentMap = enrollmentRepository.findAllByUserIdAndCourseIdIn(currentUserId.get(), courseIds).stream()
                    .collect(Collectors.toMap(
                            e -> e.getCourse().getId(),
                            Enrollment::getEnrolledAt
                    ));
        } else {
            userEnrollmentMap = Map.of();
        }

        return courses.stream()
                .map(course -> {
                    boolean enrolled = userEnrollmentMap.containsKey(course.getId());
                    Instant enrolledAt = userEnrollmentMap.get(course.getId());
                    long totalLessons = lessonCountMap.getOrDefault(course.getId(), 0L);

                    return CourseDto.builder()
                            .id(course.getId())
                            .title(course.getTitle())
                            .description(course.getDescription())
                            .slug(course.getSlug())
                            .active(course.isActive())
                            .createdAt(course.getCreatedAt())
                            .enrolled(enrolled)
                            .enrolledAt(enrolledAt)
                            .totalLessons(totalLessons)
                            .build();
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public CourseDto getCourseBySlug(String slug, Optional<Long> currentUserId) {
        Course course = courseRepository.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "slug", slug));
        return toDto(course, currentUserId);
    }

    @Transactional
    public EnrollmentDto enroll(Long courseId, Long userId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));

        if (!course.isActive()) {
            throw new ApiException("Cannot enroll in an inactive course", HttpStatus.BAD_REQUEST);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Optional<Enrollment> existing = enrollmentRepository.findByUserIdAndCourseId(userId, courseId);
        if (existing.isPresent()) {
            return toEnrollmentDto(existing.get());
        }

        Enrollment enrollment = Enrollment.builder()
                .user(user)
                .course(course)
                .enrolledAt(Instant.now())
                .build();

        Enrollment saved = enrollmentRepository.save(enrollment);
        log.info("User {} enrolled in course {} at {}", userId, courseId, saved.getEnrolledAt());

        auditService.logAction(userId, "COURSE_ENROLL", "Course", courseId, "Enrolled into: " + course.getTitle(), null);

        return toEnrollmentDto(saved);
    }

    private CourseDto toDto(Course course, Optional<Long> currentUserId) {
        boolean enrolled = false;
        Instant enrolledAt = null;

        if (currentUserId.isPresent()) {
            Optional<Enrollment> enrollment = enrollmentRepository.findByUserIdAndCourseId(currentUserId.get(), course.getId());
            if (enrollment.isPresent()) {
                enrolled = true;
                enrolledAt = enrollment.get().getEnrolledAt();
            }
        }

        long totalLessons = lessonRepository.countByCourseId(course.getId());

        return CourseDto.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .slug(course.getSlug())
                .active(course.isActive())
                .createdAt(course.getCreatedAt())
                .enrolled(enrolled)
                .enrolledAt(enrolledAt)
                .totalLessons(totalLessons)
                .build();
    }

    private EnrollmentDto toEnrollmentDto(Enrollment enrollment) {
        return EnrollmentDto.builder()
                .id(enrollment.getId())
                .userId(enrollment.getUser().getId())
                .userEmail(enrollment.getUser().getEmail())
                .userName(enrollment.getUser().getName())
                .courseId(enrollment.getCourse().getId())
                .courseTitle(enrollment.getCourse().getTitle())
                .courseSlug(enrollment.getCourse().getSlug())
                .enrolledAt(enrollment.getEnrolledAt())
                .build();
    }
}
