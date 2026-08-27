package com.mrdevcourses.modules.quiz.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mrdevcourses.common.exception.ApiException;
import com.mrdevcourses.common.exception.ResourceNotFoundException;
import com.mrdevcourses.modules.auth.model.User;
import com.mrdevcourses.modules.auth.repository.UserRepository;
import com.mrdevcourses.modules.course.repository.EnrollmentRepository;
import com.mrdevcourses.modules.lesson.model.Lesson;
import com.mrdevcourses.modules.lesson.service.LessonService;
import com.mrdevcourses.modules.quiz.dto.*;
import com.mrdevcourses.modules.quiz.model.*;
import com.mrdevcourses.modules.quiz.repository.QuizRepository;
import com.mrdevcourses.modules.quiz.repository.QuizSubmissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizSubmissionRepository quizSubmissionRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final LessonService lessonService;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public QuizDto getQuizByLessonId(Long lessonId, Long userId) {
        Quiz quiz = quizRepository.findByLessonId(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Квиз для данного урока не найден"));

        Lesson lesson = quiz.getLesson();
        if (!enrollmentRepository.existsByUserIdAndCourseId(userId, lesson.getCourse().getId())) {
            throw new ApiException("Вы не записаны на данный курс", HttpStatus.FORBIDDEN);
        }

        List<QuizQuestionDto> questions = quiz.getQuestions().stream()
                .map(q -> QuizQuestionDto.builder()
                        .id(q.getId())
                        .questionText(q.getQuestionText())
                        .questionType(q.getQuestionType())
                        .points(q.getPoints())
                        .sortOrder(q.getSortOrder())
                        .options(q.getOptions().stream()
                                .map(opt -> QuizOptionDto.builder()
                                        .id(opt.getId())
                                        .optionText(opt.getOptionText())
                                        .sortOrder(opt.getSortOrder())
                                        .build())
                                .collect(Collectors.toList()))
                        .build())
                .collect(Collectors.toList());

        return QuizDto.builder()
                .id(quiz.getId())
                .lessonId(lesson.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .passingScorePercentage(quiz.getPassingScorePercentage())
                .maxAttempts(quiz.getMaxAttempts())
                .timeLimitSeconds(quiz.getTimeLimitSeconds())
                .questionsCount(questions.size())
                .questions(questions)
                .build();
    }

    @Transactional
    public QuizResultDto submitQuiz(Long lessonId, Long userId, QuizSubmitRequest request) {
        Quiz quiz = quizRepository.findByLessonId(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Квиз для данного урока не найден"));

        Lesson lesson = quiz.getLesson();
        if (!enrollmentRepository.existsByUserIdAndCourseId(userId, lesson.getCourse().getId())) {
            throw new ApiException("Вы не записаны на данный курс", HttpStatus.FORBIDDEN);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден"));

        long attemptsCount = quizSubmissionRepository.countByUserIdAndQuizId(userId, quiz.getId());
        if (attemptsCount >= quiz.getMaxAttempts()) {
            throw new ApiException("Превышено максимальное количество попыток сдачи квиза (" + quiz.getMaxAttempts() + ")", HttpStatus.FORBIDDEN);
        }

        Map<Long, List<Long>> answers = request.getSelectedOptionIds() != null ? request.getSelectedOptionIds() : Collections.emptyMap();

        int totalQuestions = quiz.getQuestions().size();
        int correctQuestions = 0;
        Map<Long, Boolean> questionResults = new HashMap<>();
        Map<Long, String> questionExplanations = new HashMap<>();

        for (QuizQuestion question : quiz.getQuestions()) {
            List<Long> selectedOptionIds = answers.getOrDefault(question.getId(), Collections.emptyList());
            Set<Long> correctOptionIds = question.getOptions().stream()
                    .filter(QuizQuestionOption::getIsCorrect)
                    .map(QuizQuestionOption::getId)
                    .collect(Collectors.toSet());

            Set<Long> userSelectedSet = new HashSet<>(selectedOptionIds);
            boolean isQuestionCorrect = !correctOptionIds.isEmpty() && correctOptionIds.equals(userSelectedSet);

            if (isQuestionCorrect) {
                correctQuestions++;
            }

            questionResults.put(question.getId(), isQuestionCorrect);
            if (question.getExplanation() != null) {
                questionExplanations.put(question.getId(), question.getExplanation());
            }
        }

        int scorePercentage = totalQuestions > 0 ? (int) Math.round(((double) correctQuestions / totalQuestions) * 100.0) : 0;
        boolean passed = scorePercentage >= quiz.getPassingScorePercentage();

        String payloadJson = "";
        try {
            payloadJson = objectMapper.writeValueAsString(answers);
        } catch (Exception e) {
            log.warn("Failed to serialize quiz answers payload", e);
        }

        QuizSubmission submission = QuizSubmission.builder()
                .quiz(quiz)
                .user(user)
                .scorePercentage(scorePercentage)
                .passed(passed)
                .answersPayload(payloadJson)
                .startedAt(Instant.now())
                .completedAt(Instant.now())
                .build();

        submission = quizSubmissionRepository.save(submission);

        if (passed) {
            try {
                lessonService.completeLesson(lesson.getCourse().getId(), lesson.getId());
            } catch (Exception e) {
                log.warn("Failed to auto-complete lesson after quiz pass", e);
            }
        }

        return QuizResultDto.builder()
                .submissionId(submission.getId())
                .quizId(quiz.getId())
                .scorePercentage(scorePercentage)
                .passed(passed)
                .correctCount(correctQuestions)
                .totalCount(totalQuestions)
                .passingScorePercentage(quiz.getPassingScorePercentage())
                .questionResults(questionResults)
                .questionExplanations(questionExplanations)
                .build();
    }
}
