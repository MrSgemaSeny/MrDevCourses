package com.mrdevcourses.modules.progress.service;

import com.mrdevcourses.modules.auth.model.Role;
import com.mrdevcourses.modules.auth.model.User;
import com.mrdevcourses.modules.course.model.Course;
import com.mrdevcourses.modules.course.model.Enrollment;
import com.mrdevcourses.modules.course.repository.EnrollmentRepository;
import com.mrdevcourses.modules.lesson.model.Lesson;
import com.mrdevcourses.modules.lesson.repository.LessonProgressRepository;
import com.mrdevcourses.modules.lesson.repository.LessonRepository;
import com.mrdevcourses.modules.lesson.service.LessonService;
import com.mrdevcourses.modules.progress.dto.CourseProgressDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProgressServiceTest {

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private LessonRepository lessonRepository;

    @Mock
    private LessonProgressRepository lessonProgressRepository;

    @Mock
    private LessonService lessonService;

    @InjectMocks
    private ProgressService progressService;

    private Course course;
    private User user;
    private Enrollment enrollment;
    private List<Lesson> lessons;

    @BeforeEach
    void setUp() {
        course = Course.builder().id(1L).title("Course 1").slug("course-1").build();
        user = User.builder().id(10L).email("user@test.com").role(Role.STUDENT).build();
        enrollment = Enrollment.builder().id(100L).course(course).user(user).enrolledAt(Instant.now().minus(Duration.ofDays(2))).build();

        lessons = List.of(
                Lesson.builder().id(1L).course(course).dayNumber(1).build(),
                Lesson.builder().id(2L).course(course).dayNumber(2).build(),
                Lesson.builder().id(3L).course(course).dayNumber(3).build(),
                Lesson.builder().id(4L).course(course).dayNumber(4).build()
        );
    }

    @Test
    void getAllProgressForUser_ShouldCalculateStatsCorrectly() {
        when(enrollmentRepository.findAllByUserIdWithCourse(10L)).thenReturn(List.of(enrollment));
        when(lessonRepository.findByCourseIdOrderBySortOrderAscDayNumberAsc(1L)).thenReturn(lessons);
        when(lessonProgressRepository.countCompletedLessonsByUserIdAndCourseId(10L, 1L)).thenReturn(2L);

        when(lessonService.calculateUnlockTime(any(), eq(1))).thenReturn(enrollment.getEnrolledAt());
        when(lessonService.calculateUnlockTime(any(), eq(2))).thenReturn(enrollment.getEnrolledAt().plus(Duration.ofDays(1)));
        when(lessonService.calculateUnlockTime(any(), eq(3))).thenReturn(enrollment.getEnrolledAt().plus(Duration.ofDays(2)));
        when(lessonService.calculateUnlockTime(any(), eq(4))).thenReturn(enrollment.getEnrolledAt().plus(Duration.ofDays(3)));

        List<CourseProgressDto> result = progressService.getAllProgressForUser(10L);

        assertThat(result).hasSize(1);
        CourseProgressDto progress = result.get(0);
        assertThat(progress.getCourseId()).isEqualTo(1L);
        assertThat(progress.getTotalLessons()).isEqualTo(4L);
        assertThat(progress.getCompletedCount()).isEqualTo(2L);
        assertThat(progress.getProgressPercentage()).isEqualTo(50.0);
    }
}
