package com.mrdev.modules.homework.service;

import com.mrdev.modules.audit.service.AuditService;
import com.mrdev.modules.auth.model.Role;
import com.mrdev.modules.auth.repository.UserRepository;
import com.mrdev.modules.course.repository.CourseRepository;
import com.mrdev.modules.course.repository.EnrollmentRepository;
import com.mrdev.modules.homework.dto.AdminReviewHomeworkRequest;
import com.mrdev.modules.homework.dto.HomeworkSubmissionDto;
import com.mrdev.modules.homework.dto.HomeworkSubmitRequest;
import com.mrdev.modules.homework.model.HomeworkSubmission;
import com.mrdev.modules.homework.model.SubmissionStatus;
import com.mrdev.modules.homework.repository.HomeworkSubmissionRepository;
import com.mrdev.modules.lesson.model.Lesson;
import com.mrdev.modules.lesson.repository.LessonRepository;
import com.mrdev.modules.lesson.service.LessonService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HomeworkServiceTest {

    @Mock
    private HomeworkSubmissionRepository submissionRepository;

    @Mock
    private LessonRepository lessonRepository;

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private LessonService lessonService;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private HomeworkService homeworkService;

    private Lesson lesson;

    @BeforeEach
    void setUp() {
        lesson = Lesson.builder()
                .id(5L)
                .title("Day 5: React Architecture")
                .build();
    }

    @Test
    @DisplayName("submitHomework should save submission with PENDING status for mentor review")
    void submitHomework_ShouldSavePendingSubmission() {
        HomeworkSubmitRequest request = HomeworkSubmitRequest.builder()
                .codeSnippet("export const useUser = () => useQuery({ queryKey: ['user'] });")
                .repositoryUrl("https://github.com/student/hw5")
                .liveDemoUrl("https://student.github.io/hw5")
                .build();

        when(lessonRepository.findByIdAndCourseId(5L, 1L)).thenReturn(Optional.of(lesson));
        when(enrollmentRepository.existsByUserIdAndCourseId(10L, 1L)).thenReturn(true);
        when(submissionRepository.save(any(HomeworkSubmission.class))).thenAnswer(invocation -> {
            HomeworkSubmission sub = invocation.getArgument(0);
            sub.setId(100L);
            return sub;
        });

        HomeworkSubmissionDto result = homeworkService.submitHomework(1L, 5L, 10L, Role.STUDENT, request);

        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo(SubmissionStatus.PENDING);
        assertThat(result.getRepositoryUrl()).isEqualTo("https://github.com/student/hw5");
        assertThat(result.getLiveDemoUrl()).isEqualTo("https://student.github.io/hw5");

        verify(submissionRepository).save(any(HomeworkSubmission.class));
        verify(auditService).logAction(eq(10L), eq("HOMEWORK_SUBMITTED"), eq("Lesson"), eq(5L), any(), any());
    }

    @Test
    @DisplayName("reviewSubmission with PASSED should complete lesson and log audit")
    void reviewSubmission_WhenPassed_CompletesLesson() {
        HomeworkSubmission submission = HomeworkSubmission.builder()
                .id(100L)
                .lessonId(5L)
                .userId(10L)
                .courseId(1L)
                .status(SubmissionStatus.PENDING)
                .build();

        when(submissionRepository.findById(100L)).thenReturn(Optional.of(submission));
        when(submissionRepository.save(any(HomeworkSubmission.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AdminReviewHomeworkRequest reviewRequest = AdminReviewHomeworkRequest.builder()
                .status(SubmissionStatus.PASSED)
                .mentorFeedback("Отличный чистый код и живой сайт!")
                .build();

        HomeworkSubmissionDto result = homeworkService.reviewSubmission(100L, 1L, reviewRequest);

        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo(SubmissionStatus.PASSED);
        assertThat(result.getMentorFeedback()).isEqualTo("Отличный чистый код и живой сайт!");

        verify(lessonService).completeLesson(1L, 5L, 10L, Role.ADMIN);
        verify(auditService).logAction(eq(1L), eq("HOMEWORK_REVIEWED"), eq("HomeworkSubmission"), eq(100L), any(), any());
    }
}
