package com.mrdev.modules.homework.service;

import com.mrdev.modules.ai.service.GroqClient;
import com.mrdev.modules.audit.service.AuditService;
import com.mrdev.modules.auth.model.Role;
import com.mrdev.modules.course.repository.EnrollmentRepository;
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
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiCodeGraderServiceTest {

    @Mock
    private HomeworkSubmissionRepository submissionRepository;

    @Mock
    private LessonRepository lessonRepository;

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private LessonService lessonService;

    @Mock
    private GroqClient groqClient;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private AiCodeGraderService aiCodeGraderService;

    private Lesson lesson;

    @BeforeEach
    void setUp() {
        lesson = Lesson.builder()
                .id(5L)
                .title("Day 5: React Architecture")
                .build();
    }

    @Test
    @DisplayName("submitAndEvaluate should detect clean code, grade high and auto-complete lesson")
    void submitAndEvaluate_WhenCleanCode_PassesAndCompletesLesson() {
        HomeworkSubmitRequest request = HomeworkSubmitRequest.builder()
                .codeSnippet("export const useUser = () => useQuery({ queryKey: ['user'], queryFn: fetchUser });")
                .repositoryUrl("https://github.com/student/hw5")
                .build();

        when(lessonRepository.findByIdAndCourseId(5L, 1L)).thenReturn(Optional.of(lesson));
        when(enrollmentRepository.existsByUserIdAndCourseId(10L, 1L)).thenReturn(true);
        when(groqClient.generateAnswer(anyString(), anyString())).thenReturn("Оценка: 95. Отличная FSD типизация.");
        when(submissionRepository.save(any(HomeworkSubmission.class))).thenAnswer(invocation -> {
            HomeworkSubmission sub = invocation.getArgument(0);
            sub.setId(100L);
            return sub;
        });

        HomeworkSubmissionDto result = aiCodeGraderService.submitAndEvaluate(1L, 5L, 10L, Role.STUDENT, request);

        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo(SubmissionStatus.PASSED);
        assertThat(result.getScore()).isEqualTo(95);
        assertThat(result.getSecurityFlags()).isNull();

        verify(lessonService).completeLesson(1L, 5L, 10L, Role.STUDENT);
        verify(auditService).logAction(eq(10L), eq("HOMEWORK_SUBMISSION"), eq("Lesson"), eq(5L), any(), any());
    }

    @Test
    @DisplayName("submitAndEvaluate should flag hardcoded secrets and reduce score")
    void submitAndEvaluate_WhenHardcodedSecret_FlagsSecurityWarning() {
        HomeworkSubmitRequest request = HomeworkSubmitRequest.builder()
                .codeSnippet("const apiKey = \"sk-1234567890abcdef1234567890abcdef\";")
                .build();

        when(lessonRepository.findByIdAndCourseId(5L, 1L)).thenReturn(Optional.of(lesson));
        when(enrollmentRepository.existsByUserIdAndCourseId(10L, 1L)).thenReturn(true);
        when(groqClient.generateAnswer(anyString(), anyString())).thenReturn("Оценка: 90. Код нормальный.");
        when(submissionRepository.save(any(HomeworkSubmission.class))).thenAnswer(invocation -> invocation.getArgument(0));

        HomeworkSubmissionDto result = aiCodeGraderService.submitAndEvaluate(1L, 5L, 10L, Role.STUDENT, request);

        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo(SubmissionStatus.FAILED);
        assertThat(result.getScore()).isLessThanOrEqualTo(45);
        assertThat(result.getSecurityFlags()).contains("SECURITY");

        verify(lessonService, never()).completeLesson(any(), any(), any(), any());
    }
}
