package com.mrdevcourses.modules.ai.service;

import com.mrdevcourses.common.exception.ApiException;
import com.mrdevcourses.modules.ai.dto.AiTutorRequest;
import com.mrdevcourses.modules.ai.dto.AiTutorResponse;
import com.mrdevcourses.modules.ai.rag.dto.SearchResultDto;
import com.mrdevcourses.modules.ai.rag.model.ChunkType;
import com.mrdevcourses.modules.ai.rag.service.HybridSearchService;
import com.mrdevcourses.modules.audit.service.AuditService;
import com.mrdevcourses.modules.auth.model.Role;
import com.mrdevcourses.modules.course.repository.EnrollmentRepository;
import com.mrdevcourses.modules.lesson.model.Lesson;
import com.mrdevcourses.modules.lesson.repository.LessonRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiTutorServiceTest {

    @Mock
    private LessonRepository lessonRepository;

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private GroqClient groqClient;

    @Mock
    private PromptSanitizer promptSanitizer;

    @Mock
    private AuditService auditService;

    @Mock
    private HybridSearchService hybridSearchService;

    @InjectMocks
    private AiTutorService aiTutorService;

    private Lesson lesson;

    @BeforeEach
    void setUp() {
        lesson = Lesson.builder()
                .id(20L)
                .title("Day 3: Spring Security Architecture")
                .dayNumber(3)
                .content("In this lesson we explore JWT filters and SecurityFilterChain.")
                .build();
    }

    @Test
    @DisplayName("askTutor should return grounded AI answer when Groq responds and populate RAG citations")
    void askTutor_WhenGroqConfigured_ReturnsGroundedAnswer() {
        AiTutorRequest request = AiTutorRequest.builder()
                .courseId(1L)
                .lessonId(20L)
                .question("Как работает SecurityFilterChain?")
                .build();

        SearchResultDto chunkResult = SearchResultDto.builder()
                .chunkId(101L)
                .lessonId(20L)
                .courseId(1L)
                .header("SecurityFilterChain Details")
                .content("SecurityFilterChain configures all HTTP filters sequentially.")
                .chunkType(ChunkType.THEORY)
                .score(0.89)
                .matchType("HYBRID_RRF")
                .build();

        when(lessonRepository.findByIdAndCourseId(20L, 1L)).thenReturn(Optional.of(lesson));
        when(enrollmentRepository.existsByUserIdAndCourseId(10L, 1L)).thenReturn(true);
        when(promptSanitizer.sanitizeInput("Как работает SecurityFilterChain?")).thenReturn("Как работает SecurityFilterChain?");
        when(hybridSearchService.searchLesson(eq(20L), anyString(), eq(3))).thenReturn(List.of(chunkResult));
        when(groqClient.generateAnswer(anyString(), eq("Как работает SecurityFilterChain?")))
                .thenReturn("SecurityFilterChain последовательно применяет фильтры...");

        AiTutorResponse response = aiTutorService.askTutor(request, 10L, Role.STUDENT);

        assertThat(response).isNotNull();
        assertThat(response.getAnswer()).contains("SecurityFilterChain последовательно");
        assertThat(response.getLessonTitle()).isEqualTo("Day 3: Spring Security Architecture");
        assertThat(response.isFallbackMode()).isFalse();
        assertThat(response.getCitations()).hasSize(1);
        assertThat(response.getCitations().get(0).getHeader()).isEqualTo("SecurityFilterChain Details");

        verify(auditService).logAction(eq(10L), eq("AI_TUTOR_QUERY"), eq("Lesson"), eq(20L), any(), any());
    }

    @Test
    @DisplayName("askTutor should return fallback response when Groq is unavailable")
    void askTutor_WhenGroqUnavailable_ReturnsFallback() {
        AiTutorRequest request = AiTutorRequest.builder()
                .courseId(1L)
                .lessonId(20L)
                .question("Объясни тему")
                .build();

        when(lessonRepository.findByIdAndCourseId(20L, 1L)).thenReturn(Optional.of(lesson));
        when(enrollmentRepository.existsByUserIdAndCourseId(10L, 1L)).thenReturn(true);
        when(promptSanitizer.sanitizeInput(any())).thenReturn("Объясни тему");
        when(hybridSearchService.searchLesson(eq(20L), anyString(), eq(3))).thenReturn(List.of());
        when(groqClient.generateAnswer(anyString(), anyString())).thenReturn(null);

        AiTutorResponse response = aiTutorService.askTutor(request, 10L, Role.STUDENT);

        assertThat(response).isNotNull();
        assertThat(response.isFallbackMode()).isTrue();
        assertThat(response.getAnswer()).contains("В уроке **\"Day 3: Spring Security Architecture\"** рассматриваются ключевые концепции");
    }

    @Test
    @DisplayName("askTutor should reject student when not enrolled in course")
    void askTutor_WhenNotEnrolled_ThrowsForbidden() {
        AiTutorRequest request = AiTutorRequest.builder()
                .courseId(1L)
                .lessonId(20L)
                .question("Объясни тему")
                .build();

        when(lessonRepository.findByIdAndCourseId(20L, 1L)).thenReturn(Optional.of(lesson));
        when(enrollmentRepository.existsByUserIdAndCourseId(10L, 1L)).thenReturn(false);

        assertThatThrownBy(() -> aiTutorService.askTutor(request, 10L, Role.STUDENT))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Вы не записаны на этот курс");

        verify(groqClient, never()).generateAnswer(anyString(), anyString());
    }
}
