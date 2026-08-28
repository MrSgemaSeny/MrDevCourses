package com.mrdev.modules.lesson.service;

import com.mrdev.common.exception.AccessDeniedException;
import com.mrdev.common.exception.LessonLockedException;
import com.mrdev.modules.audit.service.AuditService;
import com.mrdev.modules.auth.model.Role;
import com.mrdev.modules.auth.model.User;
import com.mrdev.modules.auth.repository.UserRepository;
import com.mrdev.modules.course.model.Course;
import com.mrdev.modules.course.model.Enrollment;
import com.mrdev.modules.course.repository.CourseRepository;
import com.mrdev.modules.course.repository.EnrollmentRepository;
import com.mrdev.modules.lesson.dto.LessonDetailDto;
import com.mrdev.modules.lesson.dto.LessonSummaryDto;
import com.mrdev.modules.lesson.model.Lesson;
import com.mrdev.modules.lesson.model.LessonProgress;
import com.mrdev.modules.lesson.repository.LessonMaterialRepository;
import com.mrdev.modules.lesson.repository.LessonProgressRepository;
import com.mrdev.modules.lesson.repository.LessonRepository;
import com.mrdev.modules.quiz.repository.QuizRepository;
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
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LessonServiceDripTest {

    @Mock
    private LessonRepository lessonRepository;

    @Mock
    private LessonProgressRepository lessonProgressRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private LessonMaterialRepository lessonMaterialRepository;

    @Mock
    private QuizRepository quizRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private LessonService lessonService;

    private Course course;
    private User student;
    private Lesson day1Lesson;
    private Lesson day2Lesson;
    private Lesson day5Lesson;

    @BeforeEach
    void setUp() {
        course = Course.builder().id(1L).title("Vibe Coding").slug("vibe").active(true).build();
        student = User.builder().id(10L).email("student@test.com").role(Role.STUDENT).build();

        day1Lesson = Lesson.builder()
                .id(101L)
                .course(course)
                .title("Day 1: Intro")
                .content("Day 1 content")
                .dayNumber(1)
                .sortOrder(1)
                .build();

        day2Lesson = Lesson.builder()
                .id(102L)
                .course(course)
                .title("Day 2: Architecture")
                .content("Day 2 content")
                .dayNumber(2)
                .sortOrder(2)
                .build();

        day5Lesson = Lesson.builder()
                .id(105L)
                .course(course)
                .title("Day 5: Deploy")
                .content("Day 5 content")
                .dayNumber(5)
                .sortOrder(5)
                .build();
    }

    @Test
    void calculateUnlockTime_Day1_ShouldEqualEnrolledAt() {
        Instant enrolledAt = Instant.parse("2026-08-25T10:00:00Z");
        Instant unlockTime = lessonService.calculateUnlockTime(enrolledAt, 1);
        assertThat(unlockTime).isEqualTo(enrolledAt);
    }

    @Test
    void calculateUnlockTime_Day2_ShouldBeOneDayLater() {
        Instant enrolledAt = Instant.parse("2026-08-25T10:00:00Z");
        Instant unlockTime = lessonService.calculateUnlockTime(enrolledAt, 2);
        assertThat(unlockTime).isEqualTo(enrolledAt.plus(Duration.ofDays(1)));
    }

    @Test
    void calculateUnlockTime_Day5_ShouldBeFourDaysLater() {
        Instant enrolledAt = Instant.parse("2026-08-25T10:00:00Z");
        Instant unlockTime = lessonService.calculateUnlockTime(enrolledAt, 5);
        assertThat(unlockTime).isEqualTo(enrolledAt.plus(Duration.ofDays(4)));
    }

    @Test
    void getLessonsForCourse_Day1ShouldBeAccessibleImmediatelyOnEnrollment() {
        Instant enrolledAt = Instant.now().minus(Duration.ofMinutes(5));
        Enrollment enrollment = Enrollment.builder().id(1L).user(student).course(course).enrolledAt(enrolledAt).build();

        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(lessonRepository.findByCourseIdOrderBySortOrderAscDayNumberAsc(1L)).thenReturn(List.of(day1Lesson, day2Lesson));
        when(enrollmentRepository.findByUserIdAndCourseId(10L, 1L)).thenReturn(Optional.of(enrollment));
        when(lessonProgressRepository.findAllByUserIdAndCourseId(10L, 1L)).thenReturn(List.of());

        List<LessonSummaryDto> results = lessonService.getLessonsForCourse(1L, 10L, Role.STUDENT);

        assertThat(results).hasSize(2);
        assertThat(results.get(0).isAccessible()).isTrue();
        assertThat(results.get(0).getDayNumber()).isEqualTo(1);
        assertThat(results.get(1).isAccessible()).isFalse();
        assertThat(results.get(1).getDayNumber()).isEqualTo(2);
    }

    @Test
    void getLessonsForCourse_After2Days_Day1AndDay2ShouldBeAccessible() {
        Instant enrolledAt = Instant.now().minus(Duration.ofDays(2));
        Enrollment enrollment = Enrollment.builder().id(1L).user(student).course(course).enrolledAt(enrolledAt).build();

        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(lessonRepository.findByCourseIdOrderBySortOrderAscDayNumberAsc(1L)).thenReturn(List.of(day1Lesson, day2Lesson, day5Lesson));
        when(enrollmentRepository.findByUserIdAndCourseId(10L, 1L)).thenReturn(Optional.of(enrollment));
        when(lessonProgressRepository.findAllByUserIdAndCourseId(10L, 1L)).thenReturn(List.of());

        List<LessonSummaryDto> results = lessonService.getLessonsForCourse(1L, 10L, Role.STUDENT);

        assertThat(results.get(0).isAccessible()).isTrue();
        assertThat(results.get(1).isAccessible()).isTrue();
        assertThat(results.get(2).isAccessible()).isFalse();
    }

    @Test
    void getLessonDetail_WhenLessonLocked_ShouldThrowLessonLockedException() {
        Instant enrolledAt = Instant.now().minus(Duration.ofHours(1));
        Enrollment enrollment = Enrollment.builder().id(1L).user(student).course(course).enrolledAt(enrolledAt).build();

        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(lessonRepository.findByIdAndCourseId(102L, 1L)).thenReturn(Optional.of(day2Lesson));
        when(lessonRepository.findByCourseIdOrderBySortOrderAscDayNumberAsc(1L)).thenReturn(List.of(day1Lesson, day2Lesson));
        when(enrollmentRepository.findByUserIdAndCourseId(10L, 1L)).thenReturn(Optional.of(enrollment));

        assertThatThrownBy(() -> lessonService.getLessonDetail(1L, 102L, 10L, Role.STUDENT))
                .isInstanceOf(LessonLockedException.class)
                .satisfies(ex -> {
                    LessonLockedException lockedEx = (LessonLockedException) ex;
                    assertThat(lockedEx.getOpensAt()).isNotNull();
                    assertThat(lockedEx.getMessage()).contains("заблокирован");
                });
    }

    @Test
    void completeLesson_WhenLessonLocked_ShouldThrowLessonLockedException() {
        Instant enrolledAt = Instant.now().minus(Duration.ofHours(1));
        Enrollment enrollment = Enrollment.builder().id(1L).user(student).course(course).enrolledAt(enrolledAt).build();

        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(lessonRepository.findByIdAndCourseId(102L, 1L)).thenReturn(Optional.of(day2Lesson));
        when(userRepository.findById(10L)).thenReturn(Optional.of(student));
        when(enrollmentRepository.findByUserIdAndCourseId(10L, 1L)).thenReturn(Optional.of(enrollment));

        assertThatThrownBy(() -> lessonService.completeLesson(1L, 102L, 10L, Role.STUDENT))
                .isInstanceOf(LessonLockedException.class)
                .satisfies(ex -> {
                    LessonLockedException lockedEx = (LessonLockedException) ex;
                    assertThat(lockedEx.getOpensAt()).isNotNull();
                });
    }

    @Test
    void getLessonDetail_WhenAdmin_ShouldBypassDripCheck() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(lessonRepository.findByIdAndCourseId(105L, 1L)).thenReturn(Optional.of(day5Lesson));
        when(lessonRepository.findByCourseIdOrderBySortOrderAscDayNumberAsc(1L)).thenReturn(List.of(day1Lesson, day5Lesson));

        LessonDetailDto result = lessonService.getLessonDetail(1L, 105L, 99L, Role.ADMIN);

        assertThat(result).isNotNull();
        assertThat(result.isAccessible()).isTrue();
        assertThat(result.getTitle()).isEqualTo("Day 5: Deploy");
    }

    @Test
    void completeLesson_WhenAccessible_ShouldSaveProgressAndStreak() {
        Instant enrolledAt = Instant.now().minus(Duration.ofDays(1));
        Enrollment enrollment = Enrollment.builder().id(1L).user(student).course(course).enrolledAt(enrolledAt).build();

        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(lessonRepository.findByIdAndCourseId(101L, 1L)).thenReturn(Optional.of(day1Lesson));
        when(userRepository.findById(10L)).thenReturn(Optional.of(student));
        when(enrollmentRepository.findByUserIdAndCourseId(10L, 1L)).thenReturn(Optional.of(enrollment));
        when(lessonProgressRepository.findByUserIdAndLessonId(10L, 101L)).thenReturn(Optional.empty());
        when(lessonProgressRepository.save(any(LessonProgress.class))).thenAnswer(i -> i.getArgument(0));

        LessonSummaryDto result = lessonService.completeLesson(1L, 101L, 10L, Role.STUDENT);

        assertThat(result.isCompleted()).isTrue();
        assertThat(result.getId()).isEqualTo(101L);
    }
}
