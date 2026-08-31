package com.mrdev.modules.admin.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mrdev.modules.admin.dto.CreateMaterialRequest;
import com.mrdev.modules.auth.model.Role;
import com.mrdev.modules.auth.model.User;
import com.mrdev.modules.auth.repository.UserRepository;
import com.mrdev.modules.auth.service.JwtTokenProvider;
import com.mrdev.modules.course.model.Course;
import com.mrdev.modules.course.repository.CourseModuleRepository;
import com.mrdev.modules.course.repository.CourseRepository;
import com.mrdev.modules.course.repository.EnrollmentRepository;
import com.mrdev.modules.lesson.model.Lesson;
import com.mrdev.modules.lesson.model.MaterialType;
import com.mrdev.modules.lesson.repository.LessonMaterialRepository;
import com.mrdev.modules.lesson.repository.LessonProgressRepository;
import com.mrdev.modules.lesson.repository.LessonRepository;
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

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminMaterialControllerTest {

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
    private com.mrdev.modules.quiz.repository.QuizSubmissionRepository quizSubmissionRepository;

    @Autowired
    private com.mrdev.modules.quiz.repository.QuizQuestionOptionRepository quizQuestionOptionRepository;

    @Autowired
    private com.mrdev.modules.quiz.repository.QuizQuestionRepository quizQuestionRepository;

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
    @DisplayName("Admin can add and delete lesson materials")
    void addAndDeleteMaterial() throws Exception {
        CreateMaterialRequest req = CreateMaterialRequest.builder()
                .title("Cheat Sheet PDF")
                .materialType(MaterialType.CHEAT_SHEET)
                .url("https://example.com/sheet.pdf")
                .fileSizeBytes(1024L)
                .sortOrder(1)
                .build();

        String res = mockMvc.perform(post("/v1/admin/lessons/" + testLesson.getId() + "/materials")
                        .cookie(new Cookie("MrDev_token", adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.title", is("Cheat Sheet PDF")))
                .andExpect(jsonPath("$.data.materialType", is("CHEAT_SHEET")))
                .andReturn().getResponse().getContentAsString();

        long materialId = objectMapper.readTree(res).path("data").path("id").asLong();

        mockMvc.perform(delete("/v1/admin/materials/" + materialId)
                        .cookie(new Cookie("MrDev_token", adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }
}
