package com.mrdev.modules.admin.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mrdev.modules.admin.dto.CreateModuleRequest;
import com.mrdev.modules.admin.dto.ReorderItemRequest;
import com.mrdev.modules.admin.dto.UpdateModuleRequest;
import com.mrdev.modules.auth.model.Role;
import com.mrdev.modules.auth.model.User;
import com.mrdev.modules.auth.repository.UserRepository;
import com.mrdev.modules.auth.service.JwtTokenProvider;
import com.mrdev.modules.course.model.Course;
import com.mrdev.modules.course.repository.CourseModuleRepository;
import com.mrdev.modules.course.repository.CourseRepository;
import com.mrdev.modules.course.repository.EnrollmentRepository;
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
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminModuleControllerTest {

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
                .title("Architecture Masterclass")
                .description("System Design Course")
                .slug("arch-masterclass")
                .active(true)
                .createdAt(Instant.now())
                .build());
    }

    @Test
    @DisplayName("Admin can create, update, delete, and reorder modules")
    void moduleCrudAndReorder() throws Exception {
        // Create Module 1
        CreateModuleRequest req1 = CreateModuleRequest.builder()
                .title("Module 1: Basics")
                .description("Fundamentals")
                .sortOrder(1)
                .isFreePreview(true)
                .build();

        String res1 = mockMvc.perform(post("/v1/admin/courses/" + testCourse.getId() + "/modules")
                        .cookie(new Cookie("MrDev_token", adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req1)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.title", is("Module 1: Basics")))
                .andReturn().getResponse().getContentAsString();

        long mod1Id = objectMapper.readTree(res1).path("data").path("id").asLong();

        // Create Module 2
        CreateModuleRequest req2 = CreateModuleRequest.builder()
                .title("Module 2: Advanced")
                .description("Complex Patterns")
                .sortOrder(2)
                .isFreePreview(false)
                .build();

        String res2 = mockMvc.perform(post("/v1/admin/courses/" + testCourse.getId() + "/modules")
                        .cookie(new Cookie("MrDev_token", adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req2)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        long mod2Id = objectMapper.readTree(res2).path("data").path("id").asLong();

        // Update Module 1
        UpdateModuleRequest updateReq = UpdateModuleRequest.builder()
                .title("Module 1: Foundation Revised")
                .description("Updated description")
                .sortOrder(1)
                .isFreePreview(true)
                .build();

        mockMvc.perform(put("/v1/admin/modules/" + mod1Id)
                        .cookie(new Cookie("MrDev_token", adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title", is("Module 1: Foundation Revised")));

        // Reorder Modules (swap order)
        List<ReorderItemRequest> reorderList = List.of(
                ReorderItemRequest.builder().id(mod2Id).sortOrder(1).build(),
                ReorderItemRequest.builder().id(mod1Id).sortOrder(2).build()
        );

        mockMvc.perform(put("/v1/admin/courses/" + testCourse.getId() + "/modules/reorder")
                        .cookie(new Cookie("MrDev_token", adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reorderList)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[0].id", is((int) mod2Id)))
                .andExpect(jsonPath("$.data[1].id", is((int) mod1Id)));

        // Delete Module
        mockMvc.perform(delete("/v1/admin/modules/" + mod1Id)
                        .cookie(new Cookie("MrDev_token", adminToken)))
                .andExpect(status().isOk());
    }
}
