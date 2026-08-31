package com.mrdev.modules.help.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mrdev.modules.audit.repository.AuditLogRepository;
import com.mrdev.modules.auth.model.Role;
import com.mrdev.modules.auth.model.User;
import com.mrdev.modules.auth.repository.UserRepository;
import com.mrdev.modules.auth.service.JwtTokenProvider;
import com.mrdev.modules.course.model.Course;
import com.mrdev.modules.course.model.Enrollment;
import com.mrdev.modules.course.repository.CourseRepository;
import com.mrdev.modules.course.repository.EnrollmentRepository;
import com.mrdev.modules.help.dto.CreateHelpRequest;
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
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class StudentHelpControllerTest {

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
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private UserRepository userRepository;

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
        helpRequestRepository.deleteAll();
        enrollmentRepository.deleteAll();
        lessonRepository.deleteAll();
        courseRepository.deleteAll();
        userRepository.deleteAll();

        studentUser = userRepository.save(User.builder()
                .name("Student User")
                .email("student@test.com")
                .role(Role.STUDENT)
                .build());

        studentToken = jwtTokenProvider.generateToken(studentUser);

        testCourse = courseRepository.save(Course.builder()
                .title("Вайбкодинг Курс")
                .slug("vibecoding")
                .active(true)
                .build());

        testLesson = lessonRepository.save(Lesson.builder()
                .title("Урок 1: Сетап")
                .course(testCourse)
                .dayNumber(1)
                .sortOrder(1)
                .build());

        enrollmentRepository.save(Enrollment.builder()
                .user(studentUser)
                .course(testCourse)
                .enrolledAt(Instant.now())
                .build());
    }

    @Test
    @DisplayName("POST /v1/courses/{cId}/lessons/{lId}/help-requests creates help request and returns 200")
    void createHelpRequest_Success() throws Exception {
        CreateHelpRequest request = CreateHelpRequest.builder()
                .stepIdentifier("STEP_1")
                .stepTitle("Шаг 1: Установка VS Code")
                .problemText("Не открывается терминал внутри VS Code")
                .build();

        mockMvc.perform(post("/v1/courses/" + testCourse.getId() + "/lessons/" + testLesson.getId() + "/help-requests")
                        .cookie(new Cookie("MrDev_token", studentToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.stepIdentifier", is("STEP_1")))
                .andExpect(jsonPath("$.data.status", is("OPEN")));
    }

    @Test
    @DisplayName("GET /v1/courses/{cId}/lessons/{lId}/help-requests returns student requests for lesson")
    void getHelpRequests_Success() throws Exception {
        helpRequestRepository.save(StudentHelpRequest.builder()
                .userId(studentUser.getId())
                .courseId(testCourse.getId())
                .lessonId(testLesson.getId())
                .stepIdentifier("STEP_1")
                .stepTitle("Шаг 1")
                .problemText("Ошибка запуска")
                .status(HelpRequestStatus.OPEN)
                .build());

        mockMvc.perform(get("/v1/courses/" + testCourse.getId() + "/lessons/" + testLesson.getId() + "/help-requests")
                        .cookie(new Cookie("MrDev_token", studentToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].problemText", is("Ошибка запуска")));
    }

    @Test
    @DisplayName("IDOR Guard: Student 2 cannot see Student 1's help requests")
    void getHelpRequests_IdorProtection() throws Exception {
        helpRequestRepository.save(StudentHelpRequest.builder()
                .userId(studentUser.getId())
                .courseId(testCourse.getId())
                .lessonId(testLesson.getId())
                .stepIdentifier("STEP_1")
                .stepTitle("Шаг 1")
                .problemText("Секретный вопрос Студента 1")
                .status(HelpRequestStatus.OPEN)
                .build());

        User student2 = userRepository.save(User.builder()
                .name("Student Two")
                .email("student2@test.com")
                .role(Role.STUDENT)
                .build());
        String student2Token = jwtTokenProvider.generateToken(student2);

        enrollmentRepository.save(Enrollment.builder()
                .user(student2)
                .course(testCourse)
                .enrolledAt(Instant.now())
                .build());

        mockMvc.perform(get("/v1/courses/" + testCourse.getId() + "/lessons/" + testLesson.getId() + "/help-requests")
                        .cookie(new Cookie("MrDev_token", student2Token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(0)));
    }

    @Test
    @DisplayName("Unenrolled student cannot create help request -> 403 Forbidden")
    void createHelpRequest_Unenrolled_Returns403() throws Exception {
        User unenrolled = userRepository.save(User.builder()
                .name("Unenrolled")
                .email("unenrolled_help@test.com")
                .role(Role.STUDENT)
                .build());
        String unenrolledToken = jwtTokenProvider.generateToken(unenrolled);

        CreateHelpRequest request = CreateHelpRequest.builder()
                .stepIdentifier("STEP_1")
                .problemText("Помогите")
                .build();

        mockMvc.perform(post("/v1/courses/" + testCourse.getId() + "/lessons/" + testLesson.getId() + "/help-requests")
                        .cookie(new Cookie("MrDev_token", unenrolledToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Unauthenticated request to help endpoint -> 401 Unauthorized")
    void helpRequests_Unauthenticated_Returns401() throws Exception {
        mockMvc.perform(get("/v1/courses/" + testCourse.getId() + "/lessons/" + testLesson.getId() + "/help-requests"))
                .andExpect(status().isUnauthorized());
    }
}
