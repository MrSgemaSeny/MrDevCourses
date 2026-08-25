package com.mrdevcourses.modules.course.controller;

import com.mrdevcourses.modules.audit.repository.AuditLogRepository;
import com.mrdevcourses.modules.auth.model.Role;
import com.mrdevcourses.modules.auth.model.User;
import com.mrdevcourses.modules.auth.repository.UserRepository;
import com.mrdevcourses.modules.auth.service.JwtTokenProvider;
import com.mrdevcourses.modules.course.model.Course;
import com.mrdevcourses.modules.course.model.Enrollment;
import com.mrdevcourses.modules.course.repository.CourseRepository;
import com.mrdevcourses.modules.course.repository.EnrollmentRepository;
import com.mrdevcourses.modules.lesson.repository.LessonProgressRepository;
import com.mrdevcourses.modules.lesson.repository.LessonRepository;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
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
class CourseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private LessonProgressRepository lessonProgressRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User testUser;
    private String userToken;
    private Course activeCourse;
    private Course inactiveCourse;

    @BeforeEach
    void setUp() {
        auditLogRepository.deleteAll();
        lessonProgressRepository.deleteAll();
        lessonRepository.deleteAll();
        enrollmentRepository.deleteAll();
        courseRepository.deleteAll();
        userRepository.deleteAll();

        testUser = User.builder()
                .email("student.course@mrdevcourses.com")
                .name("Test Student")
                .role(Role.STUDENT)
                .build();
        testUser = userRepository.save(testUser);
        userToken = jwtTokenProvider.generateToken(testUser);

        activeCourse = Course.builder()
                .title("Spring Boot 3 Deep Dive")
                .description("Master modern Spring Boot 3")
                .slug("spring-boot-3-deep-dive")
                .active(true)
                .createdAt(Instant.now())
                .build();
        activeCourse = courseRepository.save(activeCourse);

        inactiveCourse = Course.builder()
                .title("Archived Legacy Course")
                .description("Old deprecated content")
                .slug("archived-legacy-course")
                .active(false)
                .createdAt(Instant.now())
                .build();
        inactiveCourse = courseRepository.save(inactiveCourse);
    }

    @Test
    @DisplayName("GET /v1/courses should return only active courses for unauthenticated user")
    void getCourses_unauthenticated_returnsOnlyActive() throws Exception {
        mockMvc.perform(get("/v1/courses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].slug", is("spring-boot-3-deep-dive")))
                .andExpect(jsonPath("$.data[0].enrolled", is(false)));
    }

    @Test
    @DisplayName("GET /v1/courses with JWT cookie should mark enrolled courses")
    void getCourses_authenticated_showsEnrolledStatus() throws Exception {
        Enrollment enrollment = Enrollment.builder()
                .user(testUser)
                .course(activeCourse)
                .enrolledAt(Instant.now())
                .build();
        enrollmentRepository.save(enrollment);

        mockMvc.perform(get("/v1/courses")
                        .cookie(new Cookie("mrdevcourses_token", userToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data[0].enrolled", is(true)));
    }

    @Test
    @DisplayName("GET /v1/courses/{slug} should return active course by slug")
    void getCourseBySlug_active_returnsCourse() throws Exception {
        mockMvc.perform(get("/v1/courses/spring-boot-3-deep-dive"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.title", is("Spring Boot 3 Deep Dive")))
                .andExpect(jsonPath("$.data.slug", is("spring-boot-3-deep-dive")));
    }

    @Test
    @DisplayName("GET /v1/courses/{slug} when not found should return 404")
    void getCourseBySlug_notFound_returns404() throws Exception {
        mockMvc.perform(get("/v1/courses/non-existent-course"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)));
    }

    @Test
    @DisplayName("POST /v1/courses/{courseId}/enroll without token should return 401")
    void enroll_unauthenticated_returns401() throws Exception {
        mockMvc.perform(post("/v1/courses/" + activeCourse.getId() + "/enroll"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /v1/courses/{courseId}/enroll with valid token should enroll student")
    void enroll_authenticated_success() throws Exception {
        mockMvc.perform(post("/v1/courses/" + activeCourse.getId() + "/enroll")
                        .cookie(new Cookie("mrdevcourses_token", userToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.courseId", is(activeCourse.getId().intValue())))
                .andExpect(jsonPath("$.data.userId", is(testUser.getId().intValue())));
    }

    @Test
    @DisplayName("POST /v1/courses/{courseId}/enroll (duplicate) should be idempotent and return 200")
    void enroll_duplicate_isIdempotent() throws Exception {
        Enrollment enrollment = Enrollment.builder()
                .user(testUser)
                .course(activeCourse)
                .enrolledAt(Instant.now())
                .build();
        enrollmentRepository.save(enrollment);

        mockMvc.perform(post("/v1/courses/" + activeCourse.getId() + "/enroll")
                        .cookie(new Cookie("mrdevcourses_token", userToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.courseId", is(activeCourse.getId().intValue())));
    }
}
