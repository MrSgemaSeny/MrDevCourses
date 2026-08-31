package com.mrdev.modules.admin.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mrdev.modules.audit.repository.AuditLogRepository;
import com.mrdev.modules.auth.model.Role;
import com.mrdev.modules.auth.model.User;
import com.mrdev.modules.auth.repository.UserRepository;
import com.mrdev.modules.auth.service.JwtTokenProvider;
import com.mrdev.modules.course.model.Course;
import com.mrdev.modules.course.repository.CourseRepository;
import com.mrdev.modules.help.dto.ResolveHelpRequest;
import com.mrdev.modules.help.model.HelpRequestStatus;
import com.mrdev.modules.help.model.StudentHelpRequest;
import com.mrdev.modules.help.repository.StudentHelpRequestRepository;
import com.mrdev.modules.lesson.model.Lesson;
import com.mrdev.modules.lesson.repository.LessonRepository;
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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminHelpControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private StudentHelpRequestRepository helpRequestRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User adminUser;
    private User studentUser;
    private String adminToken;
    private String studentToken;
    private Course testCourse;
    private Lesson testLesson;
    private StudentHelpRequest helpRequest;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        auditLogRepository.deleteAll();
        helpRequestRepository.deleteAll();
        lessonRepository.deleteAll();
        courseRepository.deleteAll();
        userRepository.deleteAll();

        adminUser = userRepository.save(User.builder()
                .name("Admin Mentor")
                .email("admin.mentor@test.com")
                .role(Role.ADMIN)
                .build());
        adminToken = jwtTokenProvider.generateToken(adminUser);

        studentUser = userRepository.save(User.builder()
                .name("Azamat Student")
                .email("azamat@test.com")
                .role(Role.STUDENT)
                .build());
        studentToken = jwtTokenProvider.generateToken(studentUser);

        testCourse = courseRepository.save(Course.builder()
                .title("Вайбкодинг: Первый сайт")
                .slug("vibecoding-1")
                .active(true)
                .build());

        testLesson = lessonRepository.save(Lesson.builder()
                .title("Урок 1: Установка Git")
                .course(testCourse)
                .dayNumber(1)
                .sortOrder(1)
                .build());

        helpRequest = helpRequestRepository.save(StudentHelpRequest.builder()
                .userId(studentUser.getId())
                .courseId(testCourse.getId())
                .lessonId(testLesson.getId())
                .stepIdentifier("STEP_2")
                .stepTitle("Шаг 2: Генерация SSH")
                .problemText("Permission denied при ssh -T")
                .errorLogs("git@github.com: Permission denied (publickey)")
                .status(HelpRequestStatus.OPEN)
                .build());
    }

    @Test
    @DisplayName("GET /v1/admin/help-requests as ADMIN returns list with enriched student and lesson data")
    void getAllHelpRequests_AsAdmin_Success() throws Exception {
        mockMvc.perform(get("/v1/admin/help-requests")
                        .cookie(new Cookie("MrDev_token", adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].studentName", is("Azamat Student")))
                .andExpect(jsonPath("$.data[0].studentEmail", is("azamat@test.com")))
                .andExpect(jsonPath("$.data[0].courseTitle", is("Вайбкодинг: Первый сайт")))
                .andExpect(jsonPath("$.data[0].lessonTitle", is("Урок 1: Установка Git")))
                .andExpect(jsonPath("$.data[0].problemText", is("Permission denied при ssh -T")))
                .andExpect(jsonPath("$.data[0].status", is("OPEN")));
    }

    @Test
    @DisplayName("GET /v1/admin/help-requests with status filter returns only matching requests")
    void getAllHelpRequests_WithFilter_Success() throws Exception {
        // Filter OPEN (matches 1)
        mockMvc.perform(get("/v1/admin/help-requests?status=OPEN")
                        .cookie(new Cookie("MrDev_token", adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)));

        // Filter RESOLVED (matches 0)
        mockMvc.perform(get("/v1/admin/help-requests?status=RESOLVED")
                        .cookie(new Cookie("MrDev_token", adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(0)));
    }

    @Test
    @DisplayName("GET /v1/admin/help-requests as STUDENT returns 403 Forbidden")
    void getAllHelpRequests_AsStudent_Forbidden() throws Exception {
        mockMvc.perform(get("/v1/admin/help-requests")
                        .cookie(new Cookie("MrDev_token", studentToken)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /v1/admin/help-requests unauthenticated returns 401 Unauthorized")
    void getAllHelpRequests_Unauthenticated_Unauthorized() throws Exception {
        mockMvc.perform(get("/v1/admin/help-requests"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /v1/admin/help-requests/{id}/resolve as ADMIN resolves ticket and records mentor solution")
    void resolveHelpRequest_AsAdmin_Success() throws Exception {
        ResolveHelpRequest resolveReq = ResolveHelpRequest.builder()
                .status(HelpRequestStatus.RESOLVED)
                .mentorSolution("Добавили SSH ключ в настройки GitHub аккаунта.")
                .build();

        mockMvc.perform(post("/v1/admin/help-requests/" + helpRequest.getId() + "/resolve")
                        .cookie(new Cookie("MrDev_token", adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resolveReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.status", is("RESOLVED")))
                .andExpect(jsonPath("$.data.mentorSolution", containsString("Добавили SSH ключ")))
                .andExpect(jsonPath("$.data.resolvedBy", is(adminUser.getId().intValue())))
                .andExpect(jsonPath("$.data.resolvedAt", notNullValue()));
    }

    @Test
    @DisplayName("POST /v1/admin/help-requests/{id}/resolve on missing ID returns 404 Not Found")
    void resolveHelpRequest_NotFound() throws Exception {
        ResolveHelpRequest resolveReq = ResolveHelpRequest.builder()
                .status(HelpRequestStatus.RESOLVED)
                .mentorSolution("Solution")
                .build();

        mockMvc.perform(post("/v1/admin/help-requests/999999/resolve")
                        .cookie(new Cookie("MrDev_token", adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resolveReq)))
                .andExpect(status().isNotFound());
    }
}
