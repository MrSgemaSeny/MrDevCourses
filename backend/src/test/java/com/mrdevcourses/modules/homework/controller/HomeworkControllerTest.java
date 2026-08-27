package com.mrdevcourses.modules.homework.controller;

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
import com.mrdevcourses.modules.homework.dto.HomeworkSubmitRequest;
import com.mrdevcourses.modules.homework.model.HomeworkSubmission;
import com.mrdevcourses.modules.homework.model.SubmissionStatus;
import com.mrdevcourses.modules.homework.repository.HomeworkSubmissionRepository;
import com.mrdevcourses.modules.lesson.model.Lesson;
import com.mrdevcourses.modules.lesson.repository.LessonMaterialRepository;
import com.mrdevcourses.modules.lesson.repository.LessonProgressRepository;
import com.mrdevcourses.modules.lesson.repository.LessonRepository;
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

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class HomeworkControllerTest {

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
    private HomeworkSubmissionRepository submissionRepository;

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

    @BeforeEach
    void setUp() {
        auditLogRepository.deleteAll();
        outboxEventRepository.deleteAll();
        submissionRepository.deleteAll();
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
                .email("hw_student@test.com")
                .name("HW Student")
                .role(Role.STUDENT)
                .build();
        studentUser = userRepository.save(studentUser);
        studentToken = jwtTokenProvider.generateToken(studentUser);

        testCourse = Course.builder()
                .title("HW Test Course")
                .description("Course for homework testing")
                .slug("hw-course")
                .active(true)
                .createdAt(Instant.now())
                .build();
        testCourse = courseRepository.save(testCourse);

        CourseModule module = CourseModule.builder()
                .course(testCourse)
                .title("HW Module")
                .sortOrder(1)
                .isFreePreview(true)
                .build();
        module = courseModuleRepository.save(module);

        testLesson = Lesson.builder()
                .course(testCourse)
                .module(module)
                .title("Day 1: Intro")
                .dayNumber(1)
                .sortOrder(1)
                .content("Introduction and homework requirements")
                .createdAt(Instant.now())
                .build();
        testLesson = lessonRepository.save(testLesson);

        Enrollment enrollment = Enrollment.builder()
                .user(studentUser)
                .course(testCourse)
                .enrolledAt(Instant.now())
                .build();
        enrollmentRepository.save(enrollment);
    }

    @Test
    @DisplayName("POST submit homework authenticated returns evaluation result")
    void submitHomework_Authenticated_ReturnsSuccess() throws Exception {
        HomeworkSubmitRequest req = HomeworkSubmitRequest.builder()
                .codeSnippet("export const test = () => 42;")
                .repositoryUrl("https://github.com/student/hw")
                .build();

        mockMvc.perform(post("/v1/courses/" + testCourse.getId() + "/lessons/" + testLesson.getId() + "/homework/submit")
                        .cookie(new Cookie("mrdevcourses_token", studentToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.status", is("PASSED")));
    }

    @Test
    @DisplayName("GET submissions returns list of user submissions")
    void getSubmissions_ReturnsList() throws Exception {
        HomeworkSubmission sub = HomeworkSubmission.builder()
                .lessonId(testLesson.getId())
                .courseId(testCourse.getId())
                .userId(studentUser.getId())
                .codeSnippet("const x = 1;")
                .status(SubmissionStatus.PASSED)
                .score(90)
                .build();
        submissionRepository.save(sub);

        mockMvc.perform(get("/v1/courses/" + testCourse.getId() + "/lessons/" + testLesson.getId() + "/homework/submissions")
                        .cookie(new Cookie("mrdevcourses_token", studentToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data[0].score", is(90)));
    }
}
