package com.mrdev.modules.admin.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mrdev.modules.admin.dto.CreateQuizOptionRequest;
import com.mrdev.modules.admin.dto.CreateQuizQuestionRequest;
import com.mrdev.modules.admin.dto.CreateQuizRequest;
import com.mrdev.modules.auth.model.Role;
import com.mrdev.modules.auth.model.User;
import com.mrdev.modules.auth.repository.UserRepository;
import com.mrdev.modules.auth.service.JwtTokenProvider;
import com.mrdev.modules.course.model.Course;
import com.mrdev.modules.course.repository.CourseModuleRepository;
import com.mrdev.modules.course.repository.CourseRepository;
import com.mrdev.modules.course.repository.EnrollmentRepository;
import com.mrdev.modules.lesson.model.Lesson;
import com.mrdev.modules.lesson.repository.LessonMaterialRepository;
import com.mrdev.modules.lesson.repository.LessonProgressRepository;
import com.mrdev.modules.lesson.repository.LessonRepository;
import com.mrdev.modules.quiz.model.QuestionType;
import com.mrdev.modules.quiz.repository.QuizQuestionOptionRepository;
import com.mrdev.modules.quiz.repository.QuizQuestionRepository;
import com.mrdev.modules.quiz.repository.QuizRepository;
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

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminQuizControllerTest {

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
    private com.mrdev.modules.quiz.repository.QuizSubmissionRepository quizSubmissionRepository;

    @Autowired
    private LessonProgressRepository lessonProgressRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private com.mrdev.modules.audit.repository.AuditLogRepository auditLogRepository;

    @Autowired
    private com.mrdev.modules.homework.repository.HomeworkSubmissionRepository homeworkSubmissionRepository;

    @Autowired
    private com.mrdev.modules.course.repository.CohortRepository cohortRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User adminUser;
    private String adminToken;
    private Course testCourse;
    private Lesson testLesson;

    @BeforeEach
    void setUp() {
        auditLogRepository.deleteAll();
        homeworkSubmissionRepository.deleteAll();
        quizSubmissionRepository.deleteAll();
        quizQuestionOptionRepository.deleteAll();
        quizQuestionRepository.deleteAll();
        quizRepository.deleteAll();
        lessonMaterialRepository.deleteAll();
        lessonProgressRepository.deleteAll();
        lessonRepository.deleteAll();
        courseModuleRepository.deleteAll();
        cohortRepository.deleteAll();
        enrollmentRepository.deleteAll();
        courseRepository.deleteAll();
        userRepository.deleteAll();

        adminUser = userRepository.save(User.builder()
                .email("admin@test.com")
                .name("Admin User")
                .role(Role.ADMIN)
                .build());
        adminToken = jwtTokenProvider.generateToken(adminUser);

        testCourse = courseRepository.save(Course.builder()
                .title("Fullstack Course")
                .description("Desc")
                .slug("fullstack-course")
                .active(true)
                .createdAt(Instant.now())
                .build());

        testLesson = lessonRepository.save(Lesson.builder()
                .course(testCourse)
                .title("Lesson 1")
                .dayNumber(1)
                .sortOrder(1)
                .build());
    }

    @Test
    @DisplayName("Admin can create, get, and delete quiz for a lesson")
    void quizLifecycle() throws Exception {
        CreateQuizOptionRequest opt1 = CreateQuizOptionRequest.builder()
                .optionText("Spring Boot")
                .isCorrect(true)
                .sortOrder(1)
                .build();

        CreateQuizOptionRequest opt2 = CreateQuizOptionRequest.builder()
                .optionText("Django")
                .isCorrect(false)
                .sortOrder(2)
                .build();

        CreateQuizQuestionRequest q1 = CreateQuizQuestionRequest.builder()
                .questionText("Which framework is Java-based?")
                .questionType(QuestionType.SINGLE_CHOICE)
                .explanation("Spring Boot is Java framework")
                .points(1)
                .sortOrder(1)
                .options(List.of(opt1, opt2))
                .build();

        CreateQuizRequest req = CreateQuizRequest.builder()
                .title("Module 1 Knowledge Check")
                .description("Check your understanding")
                .passingScorePercentage(80)
                .maxAttempts(3)
                .timeLimitSeconds(600)
                .questions(List.of(q1))
                .build();

        String res = mockMvc.perform(post("/v1/admin/lessons/" + testLesson.getId() + "/quiz")
                        .cookie(new Cookie("MrDev_token", adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title", is("Module 1 Knowledge Check")))
                .andExpect(jsonPath("$.data.questions", hasSize(1)))
                .andReturn().getResponse().getContentAsString();

        long quizId = objectMapper.readTree(res).path("data").path("id").asLong();

        // Get Quiz by Lesson
        mockMvc.perform(get("/v1/admin/lessons/" + testLesson.getId() + "/quiz")
                        .cookie(new Cookie("MrDev_token", adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id", is((int) quizId)))
                .andExpect(jsonPath("$.data.questions[0].options", hasSize(2)));

        // Delete Quiz
        mockMvc.perform(delete("/v1/admin/quizzes/" + quizId)
                        .cookie(new Cookie("MrDev_token", adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }
}
