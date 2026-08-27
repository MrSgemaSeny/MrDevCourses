package com.mrdevcourses.modules.quiz.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mrdevcourses.modules.ai.rag.repository.GlossaryEmbeddingRepository;
import com.mrdevcourses.modules.ai.rag.repository.LessonChunkRepository;
import com.mrdevcourses.modules.audit.repository.AuditLogRepository;
import com.mrdevcourses.modules.auth.model.Role;
import com.mrdevcourses.modules.auth.model.User;
import com.mrdevcourses.modules.auth.repository.UserRepository;
import com.mrdevcourses.modules.auth.service.JwtTokenProvider;
import com.mrdevcourses.modules.automation.repository.OutboxEventRepository;
import com.mrdevcourses.modules.course.model.Course;
import com.mrdevcourses.modules.course.model.CourseModule;
import com.mrdevcourses.modules.course.model.Enrollment;
import com.mrdevcourses.modules.course.repository.CourseModuleRepository;
import com.mrdevcourses.modules.course.repository.CourseRepository;
import com.mrdevcourses.modules.course.repository.EnrollmentRepository;
import com.mrdevcourses.modules.homework.repository.HomeworkSubmissionRepository;
import com.mrdevcourses.modules.lesson.model.Lesson;
import com.mrdevcourses.modules.lesson.repository.LessonMaterialRepository;
import com.mrdevcourses.modules.lesson.repository.LessonProgressRepository;
import com.mrdevcourses.modules.lesson.repository.LessonRepository;
import com.mrdevcourses.modules.quiz.dto.QuizSubmitRequest;
import com.mrdevcourses.modules.quiz.model.*;
import com.mrdevcourses.modules.quiz.repository.QuizQuestionOptionRepository;
import com.mrdevcourses.modules.quiz.repository.QuizQuestionRepository;
import com.mrdevcourses.modules.quiz.repository.QuizRepository;
import com.mrdevcourses.modules.quiz.repository.QuizSubmissionRepository;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class QuizControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CourseModuleRepository courseModuleRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private LessonMaterialRepository lessonMaterialRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuizQuestionRepository quizQuestionRepository;

    @Autowired
    private QuizQuestionOptionRepository quizQuestionOptionRepository;

    @Autowired
    private QuizSubmissionRepository quizSubmissionRepository;

    @Autowired
    private LessonProgressRepository lessonProgressRepository;

    @Autowired
    private LessonChunkRepository lessonChunkRepository;

    @Autowired
    private GlossaryEmbeddingRepository glossaryEmbeddingRepository;

    @Autowired
    private HomeworkSubmissionRepository homeworkSubmissionRepository;

    @Autowired
    private OutboxEventRepository outboxEventRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User studentUser;
    private String studentToken;
    private Course testCourse;
    private Lesson testLesson;
    private Quiz testQuiz;
    private QuizQuestion question;
    private QuizQuestionOption optCorrect;

    @BeforeEach
    void setUp() {
        auditLogRepository.deleteAll();
        outboxEventRepository.deleteAll();
        homeworkSubmissionRepository.deleteAll();
        quizSubmissionRepository.deleteAll();
        quizQuestionOptionRepository.deleteAll();
        quizQuestionRepository.deleteAll();
        quizRepository.deleteAll();
        lessonMaterialRepository.deleteAll();
        lessonProgressRepository.deleteAll();
        lessonChunkRepository.deleteAll();
        glossaryEmbeddingRepository.deleteAll();
        lessonRepository.deleteAll();
        courseModuleRepository.deleteAll();
        enrollmentRepository.deleteAll();
        courseRepository.deleteAll();
        userRepository.deleteAll();

        studentUser = User.builder()
                .email("quiz_student@test.com")
                .name("Quiz Student")
                .role(Role.STUDENT)
                .build();
        studentUser = userRepository.save(studentUser);
        studentToken = jwtTokenProvider.generateToken(studentUser);

        testCourse = Course.builder()
                .title("Quiz Test Course")
                .description("Course description")
                .slug("quiz-test-course")
                .active(true)
                .createdAt(Instant.now())
                .build();
        testCourse = courseRepository.save(testCourse);

        CourseModule module = CourseModule.builder()
                .course(testCourse)
                .title("Module 1")
                .sortOrder(1)
                .isFreePreview(true)
                .build();
        module = courseModuleRepository.save(module);

        testLesson = Lesson.builder()
                .course(testCourse)
                .module(module)
                .title("Day 1: Intro Quiz")
                .dayNumber(1)
                .sortOrder(1)
                .content("Content")
                .createdAt(Instant.now())
                .build();
        testLesson = lessonRepository.save(testLesson);

        Enrollment enrollment = Enrollment.builder()
                .user(studentUser)
                .course(testCourse)
                .enrolledAt(Instant.now())
                .build();
        enrollmentRepository.save(enrollment);

        testQuiz = Quiz.builder()
                .lesson(testLesson)
                .title("Intro Quiz Title")
                .description("Check your understanding")
                .passingScorePercentage(80)
                .maxAttempts(3)
                .timeLimitSeconds(600)
                .build();
        testQuiz = quizRepository.save(testQuiz);

        question = QuizQuestion.builder()
                .quiz(testQuiz)
                .questionText("Is Spring Boot reactive by default?")
                .questionType(QuestionType.SINGLE_CHOICE)
                .explanation("No, Spring Boot MVC uses servlet thread-per-request.")
                .points(1)
                .sortOrder(1)
                .build();
        question = quizQuestionRepository.save(question);

        optCorrect = QuizQuestionOption.builder()
                .question(question)
                .optionText("No, it uses standard Servlet MVC unless WebFlux is selected")
                .isCorrect(true)
                .sortOrder(1)
                .build();
        QuizQuestionOption optWrong = QuizQuestionOption.builder()
                .question(question)
                .optionText("Yes, always reactive")
                .isCorrect(false)
                .sortOrder(2)
                .build();
        quizQuestionOptionRepository.saveAll(List.of(optCorrect, optWrong));
    }

    @Test
    @DisplayName("GET /v1/lessons/{lessonId}/quiz returns quiz questions")
    void getQuiz_ReturnsQuizDetails() throws Exception {
        mockMvc.perform(get("/v1/lessons/" + testLesson.getId() + "/quiz")
                        .cookie(new Cookie("mrdevcourses_token", studentToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.title", is("Intro Quiz Title")))
                .andExpect(jsonPath("$.data.questionsCount", is(1)));
    }

    @Test
    @DisplayName("POST /v1/lessons/{lessonId}/quiz/submit calculates score and completes lesson")
    void submitQuiz_ReturnsResultAndAutoCompletes() throws Exception {
        QuizSubmitRequest req = QuizSubmitRequest.builder()
                .quizId(testQuiz.getId())
                .selectedOptionIds(Map.of(question.getId(), List.of(optCorrect.getId())))
                .build();

        mockMvc.perform(post("/v1/lessons/" + testLesson.getId() + "/quiz/submit")
                        .cookie(new Cookie("mrdevcourses_token", studentToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.scorePercentage", is(100)))
                .andExpect(jsonPath("$.data.passed", is(true)));
    }
}
