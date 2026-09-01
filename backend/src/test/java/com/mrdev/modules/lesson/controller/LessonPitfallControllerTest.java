package com.mrdev.modules.lesson.controller;

import com.mrdev.modules.auth.model.Role;
import com.mrdev.modules.auth.model.User;
import com.mrdev.modules.auth.repository.UserRepository;
import com.mrdev.modules.auth.service.JwtTokenProvider;
import com.mrdev.modules.course.model.Course;
import com.mrdev.modules.course.repository.CourseRepository;
import com.mrdev.modules.lesson.model.Lesson;
import com.mrdev.modules.lesson.model.LessonPitfall;
import com.mrdev.modules.lesson.repository.LessonPitfallRepository;
import com.mrdev.modules.lesson.repository.LessonRepository;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class LessonPitfallControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private LessonPitfallRepository lessonPitfallRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private Course testCourse;
    private Lesson testLesson;
    private User student;
    private String studentToken;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        String suffix = String.valueOf(System.currentTimeMillis());

        student = userRepository.save(User.builder()
                .name("Alex Student")
                .email("alex.student." + suffix + "@test.com")
                .role(Role.STUDENT)
                .build());
        studentToken = jwtTokenProvider.generateToken(student);

        testCourse = courseRepository.save(Course.builder()
                .title("Pitfalls Course " + suffix)
                .slug("pitfalls-course-" + suffix)
                .description("Testing pitfalls")
                .active(true)
                .build());

        testLesson = lessonRepository.save(Lesson.builder()
                .course(testCourse)
                .title("Lesson 1 Setup")
                .dayNumber(1)
                .durationMinutes(90)
                .build());

        lessonPitfallRepository.save(LessonPitfall.builder()
                .lesson(testLesson)
                .title("Port 5432 already in use")
                .errorSymptom("Bind for 0.0.0.0:5432 failed: port is already allocated")
                .solutionMarkdown("Stop local postgres service: `sudo systemctl stop postgresql`")
                .orderIndex(1)
                .build());

        lessonPitfallRepository.save(LessonPitfall.builder()
                .lesson(testLesson)
                .title("CORS policy error on localhost")
                .errorSymptom("Access to XMLHttpRequest blocked by CORS policy")
                .solutionMarkdown("Add allowed origin `http://localhost:5173` to SecurityConfig")
                .orderIndex(2)
                .build());
    }

    @Test
    @DisplayName("GET /v1/courses/{cId}/lessons/{lId}/pitfalls returns 200 with list of common pitfalls")
    void getPitfalls_Authenticated_Success() throws Exception {
        mockMvc.perform(get("/v1/courses/" + testCourse.getId() + "/lessons/" + testLesson.getId() + "/pitfalls")
                        .cookie(new Cookie("MrDev_token", studentToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[0].title", is("Port 5432 already in use")))
                .andExpect(jsonPath("$.data[1].title", is("CORS policy error on localhost")));
    }

    @Test
    @DisplayName("GET /v1/courses/{cId}/lessons/{lId}/pitfalls returns 200 with list of common pitfalls for public guest")
    void getPitfalls_Public_Success() throws Exception {
        mockMvc.perform(get("/v1/courses/" + testCourse.getId() + "/lessons/" + testLesson.getId() + "/pitfalls"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[0].title", is("Port 5432 already in use")))
                .andExpect(jsonPath("$.data[1].title", is("CORS policy error on localhost")));
    }

    @Test
    @DisplayName("GET /v1/courses/{cId}/lessons/{lId}/pitfalls returns 404 when lesson not found")
    void getPitfalls_NotFound_Returns404() throws Exception {
        mockMvc.perform(get("/v1/courses/" + testCourse.getId() + "/lessons/999999/pitfalls"))
                .andExpect(status().isNotFound());
    }
}