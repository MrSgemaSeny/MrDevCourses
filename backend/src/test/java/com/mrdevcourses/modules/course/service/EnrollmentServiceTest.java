package com.mrdevcourses.modules.course.service;

import com.mrdevcourses.common.exception.ApiException;
import com.mrdevcourses.common.exception.ResourceNotFoundException;
import com.mrdevcourses.modules.auth.model.Role;
import com.mrdevcourses.modules.auth.model.User;
import com.mrdevcourses.modules.auth.repository.UserRepository;
import com.mrdevcourses.modules.course.dto.EnrollmentDto;
import com.mrdevcourses.modules.course.model.Course;
import com.mrdevcourses.modules.course.model.Enrollment;
import com.mrdevcourses.modules.course.repository.CourseRepository;
import com.mrdevcourses.modules.course.repository.EnrollmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EnrollmentServiceTest {

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private EnrollmentService enrollmentService;

    private Course activeCourse;
    private User studentUser;

    @BeforeEach
    void setUp() {
        activeCourse = Course.builder()
                .id(1L)
                .title("Java Masterclass")
                .slug("java-masterclass")
                .description("In-depth Java")
                .isActive(true)
                .createdAt(Instant.now())
                .build();

        studentUser = User.builder()
                .id(100L)
                .email("student@example.com")
                .name("Student User")
                .role(Role.STUDENT)
                .build();
    }

    @Test
    void enrollStudent_WhenValid_ShouldSaveAndReturnEnrollmentDto() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(activeCourse));
        when(userRepository.findById(100L)).thenReturn(Optional.of(studentUser));
        when(enrollmentRepository.findByUserIdAndCourseId(100L, 1L)).thenReturn(Optional.empty());
        when(enrollmentRepository.save(any(Enrollment.class))).thenAnswer(invocation -> {
            Enrollment e = invocation.getArgument(0);
            e.setId(10L);
            return e;
        });

        EnrollmentDto result = enrollmentService.enrollStudent(1L, 100L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(10L);
        assertThat(result.getCourseId()).isEqualTo(1L);
        assertThat(result.getCourseTitle()).isEqualTo("Java Masterclass");
        assertThat(result.getUserId()).isEqualTo(100L);
        assertThat(result.getUserEmail()).isEqualTo("student@example.com");
        verify(enrollmentRepository).save(any(Enrollment.class));
    }

    @Test
    void enrollStudent_WhenAlreadyEnrolled_ShouldBeIdempotentAndNotDuplicate() {
        Enrollment existing = Enrollment.builder()
                .id(77L)
                .course(activeCourse)
                .user(studentUser)
                .enrolledAt(Instant.now().minusSeconds(3600))
                .build();

        when(courseRepository.findById(1L)).thenReturn(Optional.of(activeCourse));
        when(userRepository.findById(100L)).thenReturn(Optional.of(studentUser));
        when(enrollmentRepository.findByUserIdAndCourseId(100L, 1L)).thenReturn(Optional.of(existing));

        EnrollmentDto result = enrollmentService.enrollStudent(1L, 100L);

        assertThat(result.getId()).isEqualTo(77L);
        verify(enrollmentRepository, never()).save(any(Enrollment.class));
    }

    @Test
    void enrollStudent_WhenCourseInactive_ShouldThrowBadRequest() {
        activeCourse.setActive(false);
        when(courseRepository.findById(1L)).thenReturn(Optional.of(activeCourse));

        assertThatThrownBy(() -> enrollmentService.enrollStudent(1L, 100L))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("inactive");
    }

    @Test
    void enrollStudent_WhenCourseNotFound_ShouldThrow404() {
        when(courseRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> enrollmentService.enrollStudent(999L, 100L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void enrollStudent_WhenUserNotFound_ShouldThrow404() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(activeCourse));
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> enrollmentService.enrollStudent(1L, 999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void isStudentEnrolled_ShouldCheckRepository() {
        when(enrollmentRepository.existsByUserIdAndCourseId(100L, 1L)).thenReturn(true);

        boolean enrolled = enrollmentService.isStudentEnrolled(100L, 1L);

        assertThat(enrolled).isTrue();
        verify(enrollmentRepository).existsByUserIdAndCourseId(100L, 1L);
    }

    @Test
    void getStudentEnrollments_ShouldReturnList() {
        Enrollment enrollment = Enrollment.builder()
                .id(1L)
                .course(activeCourse)
                .user(studentUser)
                .enrolledAt(Instant.now())
                .build();
        when(enrollmentRepository.findAllByUserIdWithCourse(100L)).thenReturn(List.of(enrollment));

        List<EnrollmentDto> results = enrollmentService.getStudentEnrollments(100L);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getCourseSlug()).isEqualTo("java-masterclass");
    }
}
