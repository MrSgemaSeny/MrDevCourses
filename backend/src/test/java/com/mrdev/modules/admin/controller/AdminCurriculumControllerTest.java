package com.mrdev.modules.admin.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mrdev.modules.admin.dto.ReorderItemRequest;
import com.mrdev.modules.auth.model.Role;
import com.mrdev.modules.auth.model.User;
import com.mrdev.modules.auth.repository.UserRepository;
import com.mrdev.modules.auth.service.JwtTokenProvider;
import com.mrdev.modules.course.dto.CreateCourseRequest;
import com.mrdev.modules.course.dto.UpdateCourseRequest;
import com.mrdev.modules.course.model.Course;
import com.mrdev.modules.course.repository.CourseModuleRepository;
import com.mrdev.modules.course.repository.CourseRepository;
import com.mrdev.modules.course.repository.EnrollmentRepository;
import com.mrdev.modules.lesson.dto.CreateLessonRequest;
import com.mrdev.modules.lesson.dto.UpdateLessonRequest;
import com.mrdev.modules.lesson.model.Lesson;
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
class AdminCurriculumControllerTest {

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
    private JwtTokenProvider jwtTokenProvider;

    private User adminUser;
    private User studentUser;
    private String adminToken;
    private String studentToken;
    private Course testCourse;

    @BeforeEach
    void setUp() {
        quizRepository.deleteAll();
        lessonMaterialRepository.deleteAll();
        lessonProgressRepository.deleteAll();
        lessonRepository.deleteAll();
        courseModuleRepository.deleteAll();
        enrollmentRepository.deleteAll();
        courseRepository.deleteAll();
        userRepository.deleteAll();

        adminUser = userRepository.save(User.builder()
                .email("admin@test.com")
                .name("Admin User")
                .role(Role.ADMIN)
                .build());
        adminToken = jwtTokenProvider.generateToken(adminUser);

        studentUser = userRepository.save(User.builder()
                .email("student@test.com")
                .name("Student User")
                .role(Role.STUDENT)
                .build());
        studentToken = jwtTokenProvider.generateToken(studentUser);

        testCourse = courseRepository.save(Course.builder()
                .title("Java Masterclass")
                .description("Complete Java Course")
                .slug("java-masterclass")
                .active(true)
                .createdAt(Instant.now())
                .build());
    }

    @Test
    @DisplayName("Admin can create, update, and delete courses")
    void courseCrudOperations() throws Exception {
        // Create Course
        CreateCourseRequest createReq = CreateCourseRequest.builder()
                .title("Spring Boot Pro")
                .description("Advanced Spring Boot")
                .slug("spring-boot-pro")
                .active(true)
                .build();

        mockMvc.perform(post("/v1/admin/courses")
                        .cookie(new Cookie("MrDev_token", adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.title", is("Spring Boot Pro")));

        // Update Course
        UpdateCourseRequest updateReq = UpdateCourseRequest.builder()
                .title("Spring Boot Pro 3.3")
                .description("Updated description")
                .slug("spring-boot-pro")
                .active(true)
                .build();

        mockMvc.perform(put("/v1/admin/courses/" + testCourse.getId())
                        .cookie(new Cookie("MrDev_token", adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title", is("Spring Boot Pro 3.3")));

        // Delete Course
        mockMvc.perform(delete("/v1/admin/courses/" + testCourse.getId())
                        .cookie(new Cookie("MrDev_token", adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }

    @Test
    @DisplayName("Admin can create, update, delete, and reorder lessons")
    void lessonCrudAndReorder() throws Exception {
        // Create Lesson 1
        CreateLessonRequest lesson1Req = CreateLessonRequest.builder()
                .title("Lesson 1: Intro")
                .content("Introduction to course")
                .dayNumber(1)
                .sortOrder(1)
                .build();

        String res1 = mockMvc.perform(post("/v1/admin/courses/" + testCourse.getId() + "/lessons")
                        .cookie(new Cookie("MrDev_token", adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(lesson1Req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.title", is("Lesson 1: Intro")))
                .andReturn().getResponse().getContentAsString();

        long lesson1Id = objectMapper.readTree(res1).path("data").path("id").asLong();

        // Create Lesson 2
        CreateLessonRequest lesson2Req = CreateLessonRequest.builder()
                .title("Lesson 2: Advanced")
                .content("Advanced topics")
                .dayNumber(2)
                .sortOrder(2)
                .build();

        String res2 = mockMvc.perform(post("/v1/admin/courses/" + testCourse.getId() + "/lessons")
                        .cookie(new Cookie("MrDev_token", adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(lesson2Req)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        long lesson2Id = objectMapper.readTree(res2).path("data").path("id").asLong();

        // Update Lesson 1
        UpdateLessonRequest updateReq = UpdateLessonRequest.builder()
                .title("Lesson 1: Introduction Modified")
                .content("Updated content")
                .dayNumber(1)
                .sortOrder(1)
                .build();

        mockMvc.perform(put("/v1/admin/lessons/" + lesson1Id)
                        .cookie(new Cookie("MrDev_token", adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title", is("Lesson 1: Introduction Modified")));

        // Reorder Lessons (swap order)
        List<ReorderItemRequest> reorderItems = List.of(
                ReorderItemRequest.builder().id(lesson2Id).sortOrder(1).build(),
                ReorderItemRequest.builder().id(lesson1Id).sortOrder(2).build()
        );

        mockMvc.perform(put("/v1/admin/courses/" + testCourse.getId() + "/lessons/reorder")
                        .cookie(new Cookie("MrDev_token", adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reorderItems)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[0].id", is((int) lesson2Id)))
                .andExpect(jsonPath("$.data[0].dayNumber", is(1)))
                .andExpect(jsonPath("$.data[1].id", is((int) lesson1Id)))
                .andExpect(jsonPath("$.data[1].dayNumber", is(2)));

        // Delete Lesson
        mockMvc.perform(delete("/v1/admin/lessons/" + lesson1Id)
                        .cookie(new Cookie("MrDev_token", adminToken)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Non-admin users are forbidden from admin endpoints")
    void nonAdminForbidden() throws Exception {
        mockMvc.perform(get("/v1/admin/courses")
                        .cookie(new Cookie("MrDev_token", studentToken)))
                .andExpect(status().isForbidden());
    }
}
