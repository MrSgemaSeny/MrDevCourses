package com.mrdev.modules.project.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mrdev.modules.audit.repository.AuditLogRepository;
import com.mrdev.modules.auth.model.Role;
import com.mrdev.modules.auth.model.User;
import com.mrdev.modules.auth.repository.UserRepository;
import com.mrdev.modules.auth.service.JwtTokenProvider;
import com.mrdev.modules.course.model.Course;
import com.mrdev.modules.course.repository.CourseRepository;
import com.mrdev.modules.project.dto.CreateProjectShowcaseRequest;
import com.mrdev.modules.project.model.ProjectShowcase;
import com.mrdev.modules.project.repository.ProjectShowcaseRepository;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProjectShowcaseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProjectShowcaseRepository showcaseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User student;
    private String studentToken;
    private Course course;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        showcaseRepository.deleteAll();

        String suffix = String.valueOf(System.currentTimeMillis());

        student = userRepository.save(User.builder()
                .name("Azamat Graduate")
                .email("azamat.grad." + suffix + "@test.com")
                .role(Role.STUDENT)
                .avatarUrl("https://avatars.githubusercontent.com/u/12345")
                .build());

        studentToken = jwtTokenProvider.generateToken(student);

        course = courseRepository.findAll().stream().findFirst().orElseGet(() ->
                courseRepository.save(Course.builder()
                        .title("Вайбкодинг: Первый сайт")
                        .slug("vibecoding-" + suffix)
                        .active(true)
                        .build())
        );
    }

    @Test
    @DisplayName("GET /v1/projects is public and returns list of showcases")
    void getAllProjects_Public_ReturnsList() throws Exception {
        showcaseRepository.save(ProjectShowcase.builder()
                .user(student)
                .course(course)
                .title("Habit Tracker Vibe")
                .description("Мой первый задеплоенный трекер привычек")
                .liveDemoUrl("https://habit-tracker.vercel.app")
                .githubRepoUrl("https://github.com/azamat/habit-tracker")
                .authorName("Azamat Graduate")
                .featured(true)
                .likesCount(5)
                .build());

        mockMvc.perform(get("/v1/projects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].title", is("Habit Tracker Vibe")))
                .andExpect(jsonPath("$.data[0].authorName", is("Azamat Graduate")))
                .andExpect(jsonPath("$.data[0].likesCount", is(5)))
                .andExpect(jsonPath("$.data[0].featured", is(true)));
    }

    @Test
    @DisplayName("POST /v1/projects authenticated creates showcase and returns 200")
    void createProject_Authenticated_Success() throws Exception {
        CreateProjectShowcaseRequest req = CreateProjectShowcaseRequest.builder()
                .courseId(course.getId())
                .title("AI Prompt Generator")
                .description("Генератор системных промптов")
                .liveDemoUrl("https://ai-prompt-gen.vercel.app")
                .githubRepoUrl("https://github.com/azamat/prompt-gen")
                .techStack("React 19, Tailwind CSS, OpenAI API")
                .build();

        mockMvc.perform(post("/v1/projects")
                        .cookie(new Cookie("MrDev_token", studentToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.title", is("AI Prompt Generator")))
                .andExpect(jsonPath("$.data.authorName", is("Azamat Graduate")))
                .andExpect(jsonPath("$.data.liveDemoUrl", is("https://ai-prompt-gen.vercel.app")));
    }

    @Test
    @DisplayName("POST /v1/projects unauthenticated returns 401 Unauthorized")
    void createProject_Unauthenticated_Returns401() throws Exception {
        CreateProjectShowcaseRequest req = CreateProjectShowcaseRequest.builder()
                .title("Unauthorized project")
                .description("No token")
                .liveDemoUrl("https://demo.vercel.app")
                .githubRepoUrl("https://github.com/repo")
                .build();

        mockMvc.perform(post("/v1/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /v1/projects/{id}/like increments like count")
    void likeProject_Public_Success() throws Exception {
        ProjectShowcase p = showcaseRepository.save(ProjectShowcase.builder()
                .user(student)
                .course(course)
                .title("Dev Wall")
                .description("Description")
                .liveDemoUrl("https://demo.app")
                .githubRepoUrl("https://github.com/repo")
                .authorName("Azamat")
                .likesCount(0)
                .build());

        mockMvc.perform(post("/v1/projects/" + p.getId() + "/like"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }
}
