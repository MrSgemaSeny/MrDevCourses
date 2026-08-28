package com.mrdev.modules.course.service;

import com.mrdev.common.exception.ApiException;
import com.mrdev.common.exception.ResourceNotFoundException;
import com.mrdev.modules.auth.model.User;
import com.mrdev.modules.auth.repository.UserRepository;
import com.mrdev.modules.course.dto.EnrollmentDto;
import com.mrdev.modules.course.model.Course;
import com.mrdev.modules.course.model.Enrollment;
import com.mrdev.modules.course.repository.CourseRepository;
import com.mrdev.modules.course.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    @Transactional
    public EnrollmentDto enrollStudent(Long courseId, Long userId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));

        if (!course.isActive()) {
            throw new ApiException("Cannot enroll in an inactive course", HttpStatus.BAD_REQUEST);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Gracefully handle idempotency: if already enrolled, return existing enrollment
        Optional<Enrollment> existing = enrollmentRepository.findByUserIdAndCourseId(userId, courseId);
        if (existing.isPresent()) {
            log.info("User ID {} is already enrolled in course ID {}, returning existing enrollment", userId, courseId);
            return toEnrollmentDto(existing.get());
        }

        try {
            Enrollment newEnrollment = Enrollment.builder()
                    .user(user)
                    .course(course)
                    .enrolledAt(Instant.now())
                    .build();

            Enrollment saved = enrollmentRepository.save(newEnrollment);
            log.info("User ID {} successfully enrolled into course '{}' (ID: {})", userId, course.getTitle(), courseId);
            return toEnrollmentDto(saved);
        } catch (DataIntegrityViolationException e) {
            // Concurrent enrollment race condition fallback
            log.warn("Duplicate enrollment race condition caught for user {} and course {}", userId, courseId);
            return enrollmentRepository.findByUserIdAndCourseId(userId, courseId)
                    .map(this::toEnrollmentDto)
                    .orElseThrow(() -> new ApiException("Failed to complete enrollment", HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @Transactional(readOnly = true)
    public boolean isStudentEnrolled(Long userId, Long courseId) {
        return enrollmentRepository.existsByUserIdAndCourseId(userId, courseId);
    }

    @Transactional(readOnly = true)
    public Optional<EnrollmentDto> getEnrollment(Long userId, Long courseId) {
        return enrollmentRepository.findByUserIdAndCourseId(userId, courseId)
                .map(this::toEnrollmentDto);
    }

    @Transactional(readOnly = true)
    public List<EnrollmentDto> getStudentEnrollments(Long userId) {
        return enrollmentRepository.findAllByUserIdWithCourse(userId).stream()
                .map(this::toEnrollmentDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public long getCourseEnrollmentCount(Long courseId) {
        return enrollmentRepository.countByCourseId(courseId);
    }

    public EnrollmentDto toEnrollmentDto(Enrollment enrollment) {
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
