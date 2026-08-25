package com.mrdevcourses.modules.course.service;

import com.mrdevcourses.common.exception.ApiException;
import com.mrdevcourses.common.exception.ResourceNotFoundException;
import com.mrdevcourses.modules.audit.service.AuditService;
import com.mrdevcourses.modules.auth.model.Role;
import com.mrdevcourses.modules.auth.model.User;
import com.mrdevcourses.modules.auth.repository.UserRepository;
import com.mrdevcourses.modules.course.dto.CourseDto;
import com.mrdevcourses.modules.course.dto.EnrollmentDto;
import com.mrdevcourses.modules.course.model.Course;
import com.mrdevcourses.modules.course.model.Enrollment;
import com.mrdevcourses.modules.course.repository.CourseRepository;
import com.mrdevcourses.modules.course.repository.EnrollmentRepository;
import com.mrdevcourses.modules.lesson.repository.LessonRepository;
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
class CourseServiceTest {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private LessonRepository lessonRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private CourseService courseService;

    private Course testCourse;
    private User testUser;

    @BeforeEach
    void setUp() {
        testCourse = Course.builder()
                .id(1L)
                .title("Test Course")
                .description("Test Description")
                .slug("test-course")
                .active(true)
                .createdAt(Instant.now())
                .build();

        testUser = User.builder()
                .id(10L)
                .email("student@test.com")
                .name("Student Test")
                .role(Role.STUDENT)
                .build();
    }

    @Test
    void getActiveCourses_ShouldReturnListOfCourses() {
        when(courseRepository.findByActiveTrueOrderByCreatedAtDesc()).thenReturn(List.of(testCourse));
        when(lessonRepository.countByCourseId(1L)).thenReturn(5L);

        List<CourseDto> result = courseService.getActiveCourses(Optional.empty());

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Test Course");
        assertThat(result.get(0).getTotalLessons()).isEqualTo(5L);
        assertThat(result.get(0).isEnrolled()).isFalse();
    }

    @Test
    void getActiveCourses_WithEnrolledUser_ShouldMarkEnrolled() {
        when(courseRepository.findByActiveTrueOrderByCreatedAtDesc()).thenReturn(List.of(testCourse));
        when(lessonRepository.countByCourseId(1L)).thenReturn(5L);
        Enrollment enrollment = Enrollment.builder().id(100L).user(testUser).course(testCourse).enrolledAt(Instant.now()).build();
        when(enrollmentRepository.findByUserIdAndCourseId(10L, 1L)).thenReturn(Optional.of(enrollment));

        List<CourseDto> result = courseService.getActiveCourses(Optional.of(10L));

        assertThat(result).hasSize(1);
        assertThat(result.get(0).isEnrolled()).isTrue();
    }

    @Test
    void getCourseBySlug_WhenExists_ShouldReturnCourse() {
        when(courseRepository.findBySlugAndActiveTrue("test-course")).thenReturn(Optional.of(testCourse));
        when(lessonRepository.countByCourseId(1L)).thenReturn(3L);

        CourseDto result = courseService.getCourseBySlug("test-course", Optional.empty());

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getSlug()).isEqualTo("test-course");
    }

    @Test
    void getCourseBySlug_WhenNotFound_ShouldThrow() {
        when(courseRepository.findBySlugAndActiveTrue("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> courseService.getCourseBySlug("missing", Optional.empty()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void enroll_WhenValid_ShouldCreateEnrollment() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(testCourse));
        when(userRepository.findById(10L)).thenReturn(Optional.of(testUser));
        when(enrollmentRepository.findByUserIdAndCourseId(10L, 1L)).thenReturn(Optional.empty());
        when(enrollmentRepository.save(any(Enrollment.class))).thenAnswer(invocation -> {
            Enrollment e = invocation.getArgument(0);
            e.setId(99L);
            return e;
        });

        EnrollmentDto result = courseService.enroll(1L, 10L);

        assertThat(result).isNotNull();
        assertThat(result.getCourseId()).isEqualTo(1L);
        assertThat(result.getUserId()).isEqualTo(10L);
        verify(enrollmentRepository).save(any(Enrollment.class));
    }

    @Test
    void enroll_WhenAlreadyEnrolled_ShouldReturnExistingWithoutDuplicateSave() {
        Enrollment existing = Enrollment.builder().id(55L).user(testUser).course(testCourse).enrolledAt(Instant.now()).build();
        when(courseRepository.findById(1L)).thenReturn(Optional.of(testCourse));
        when(userRepository.findById(10L)).thenReturn(Optional.of(testUser));
        when(enrollmentRepository.findByUserIdAndCourseId(10L, 1L)).thenReturn(Optional.of(existing));

        EnrollmentDto result = courseService.enroll(1L, 10L);

        assertThat(result.getId()).isEqualTo(55L);
        verify(enrollmentRepository, never()).save(any(Enrollment.class));
    }

    @Test
    void enroll_WhenCourseInactive_ShouldThrow() {
        testCourse.setActive(false);
        when(courseRepository.findById(1L)).thenReturn(Optional.of(testCourse));

        assertThatThrownBy(() -> courseService.enroll(1L, 10L))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("inactive");
    }
}
