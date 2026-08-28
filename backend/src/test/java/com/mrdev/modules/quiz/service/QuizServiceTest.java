package com.mrdev.modules.quiz.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mrdev.common.exception.ApiException;
import com.mrdev.modules.auth.model.User;
import com.mrdev.modules.auth.repository.UserRepository;
import com.mrdev.modules.course.model.Course;
import com.mrdev.modules.course.repository.EnrollmentRepository;
import com.mrdev.modules.lesson.model.Lesson;
import com.mrdev.modules.lesson.service.LessonService;
import com.mrdev.modules.quiz.dto.QuizDto;
import com.mrdev.modules.quiz.dto.QuizResultDto;
import com.mrdev.modules.quiz.dto.QuizSubmitRequest;
import com.mrdev.modules.quiz.model.*;
import com.mrdev.modules.quiz.repository.QuizRepository;
import com.mrdev.modules.quiz.repository.QuizSubmissionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QuizServiceTest {

    @Mock
    private QuizRepository quizRepository;

    @Mock
    private QuizSubmissionRepository quizSubmissionRepository;

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private LessonService lessonService;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private QuizService quizService;

    private Course course;
    private Lesson lesson;
    private Quiz quiz;
    private User user;
    private QuizQuestion question1;
    private QuizQuestionOption optCorrect;
    private QuizQuestionOption optWrong;

    @BeforeEach
    void setUp() {
        course = Course.builder().id(1L).title("Test Course").build();
        lesson = Lesson.builder().id(10L).course(course).title("Lesson with quiz").build();

        optCorrect = QuizQuestionOption.builder().id(101L).optionText("Correct").isCorrect(true).build();
        optWrong = QuizQuestionOption.builder().id(102L).optionText("Wrong").isCorrect(false).build();

        question1 = QuizQuestion.builder()
                .id(50L)
                .questionText("Question 1?")
                .questionType(QuestionType.SINGLE_CHOICE)
                .points(1)
                .explanation("Because it is correct.")
                .options(List.of(optCorrect, optWrong))
                .build();

        quiz = Quiz.builder()
                .id(1L)
                .lesson(lesson)
                .title("Architectural Quiz")
                .passingScorePercentage(80)
                .maxAttempts(3)
                .questions(List.of(question1))
                .build();

        user = User.builder().id(20L).email("student@test.com").build();
    }

    @Test
    @DisplayName("getQuizByLessonId masks isCorrect options for student")
    void getQuizByLessonId_MasksAnswers() {
        when(quizRepository.findByLessonId(10L)).thenReturn(Optional.of(quiz));
        when(enrollmentRepository.existsByUserIdAndCourseId(20L, 1L)).thenReturn(true);

        QuizDto result = quizService.getQuizByLessonId(10L, 20L);

        assertThat(result.getTitle()).isEqualTo("Architectural Quiz");
        assertThat(result.getQuestions()).hasSize(1);
        assertThat(result.getQuestions().get(0).getOptions()).hasSize(2);
    }

    @Test
    @DisplayName("getQuizByLessonId throws Forbidden if user not enrolled")
    void getQuizByLessonId_NotEnrolled_ThrowsForbidden() {
        when(quizRepository.findByLessonId(10L)).thenReturn(Optional.of(quiz));
        when(enrollmentRepository.existsByUserIdAndCourseId(20L, 1L)).thenReturn(false);

        assertThatThrownBy(() -> quizService.getQuizByLessonId(10L, 20L))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("не записаны");
    }

    @Test
    @DisplayName("submitQuiz evaluates 100% score, triggers auto-completion of lesson")
    void submitQuiz_Passes_CompletesLesson() {
        when(quizRepository.findByLessonId(10L)).thenReturn(Optional.of(quiz));
        when(enrollmentRepository.existsByUserIdAndCourseId(20L, 1L)).thenReturn(true);
        when(userRepository.findById(20L)).thenReturn(Optional.of(user));
        when(quizSubmissionRepository.countByUserIdAndQuizId(20L, 1L)).thenReturn(0L);

        QuizSubmission savedSub = QuizSubmission.builder().id(999L).scorePercentage(100).passed(true).build();
        when(quizSubmissionRepository.save(any(QuizSubmission.class))).thenReturn(savedSub);

        QuizSubmitRequest request = QuizSubmitRequest.builder()
                .quizId(1L)
                .selectedOptionIds(Map.of(50L, List.of(101L)))
                .build();

        QuizResultDto result = quizService.submitQuiz(10L, 20L, request);

        assertThat(result.getPassed()).isTrue();
        assertThat(result.getScorePercentage()).isEqualTo(100);
        assertThat(result.getCorrectCount()).isEqualTo(1);
        verify(lessonService).completeLesson(1L, 10L);
    }

    @Test
    @DisplayName("submitQuiz throws Forbidden if max attempts exceeded")
    void submitQuiz_MaxAttemptsExceeded_ThrowsForbidden() {
        when(quizRepository.findByLessonId(10L)).thenReturn(Optional.of(quiz));
        when(enrollmentRepository.existsByUserIdAndCourseId(20L, 1L)).thenReturn(true);
        when(userRepository.findById(20L)).thenReturn(Optional.of(user));
        when(quizSubmissionRepository.countByUserIdAndQuizId(20L, 1L)).thenReturn(3L);

        QuizSubmitRequest request = QuizSubmitRequest.builder().quizId(1L).build();

        assertThatThrownBy(() -> quizService.submitQuiz(10L, 20L, request))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Превышено максимальное количество попыток");
    }
}
