package com.mrdev.modules.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mrdev.modules.auth.dto.UpdateUserProfileRequest;
import com.mrdev.modules.auth.model.Role;
import com.mrdev.modules.auth.model.User;
import com.mrdev.modules.auth.repository.UserRepository;
import com.mrdev.modules.auth.service.JwtTokenProvider;
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

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserProfileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User student;
    private String studentToken;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        String suffix = String.valueOf(System.currentTimeMillis());

        student = userRepository.save(User.builder()
                .name("Dias Developer")
                .email("dias.dev." + suffix + "@test.com")
                .role(Role.STUDENT)
                .avatarUrl("https://avatars.githubusercontent.com/u/999")
                .telegramUsername("dias_dev")
                .githubUsername("dias-code")
                .bio("Junior Full-Stack Engineer learning vibe coding.")
                .goal("Launch my first AI SaaS")
                .currentStreak(5)
                .longestStreak(10)
                .build());

        studentToken = jwtTokenProvider.generateToken(student);
    }

    @Test
    @DisplayName("GET /v1/users/profile returns 200 and UserProfileDto with stats when authenticated")
    void getProfile_Authenticated_Success() throws Exception {
        mockMvc.perform(get("/v1/users/profile")
                        .cookie(new Cookie("MrDev_token", studentToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.email", is(student.getEmail())))
                .andExpect(jsonPath("$.data.name", is("Dias Developer")))
                .andExpect(jsonPath("$.data.telegramUsername", is("dias_dev")))
                .andExpect(jsonPath("$.data.githubUsername", is("dias-code")))
                .andExpect(jsonPath("$.data.goal", is("Launch my first AI SaaS")))
                .andExpect(jsonPath("$.data.currentStreak", is(5)))
                .andExpect(jsonPath("$.data.longestStreak", is(10)));
    }

    @Test
    @DisplayName("GET /v1/users/profile returns 401 Unauthorized when unauthenticated")
    void getProfile_Unauthenticated_Returns401() throws Exception {
        mockMvc.perform(get("/v1/users/profile"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("PUT /v1/users/profile updates profile fields and strips leading @ from handles")
    void updateProfile_Authenticated_Success() throws Exception {
        UpdateUserProfileRequest request = UpdateUserProfileRequest.builder()
                .name("Dias Senior")
                .avatarUrl("https://images.unsplash.com/avatar.jpg")
                .telegramUsername("@dias_senior")
                .githubUsername("@dias-senior-dev")
                .bio("Building high-throughput microservices.")
                .goal("Become a Senior Architect")
                .build();

        mockMvc.perform(put("/v1/users/profile")
                        .cookie(new Cookie("MrDev_token", studentToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.name", is("Dias Senior")))
                .andExpect(jsonPath("$.data.avatarUrl", is("https://images.unsplash.com/avatar.jpg")))
                .andExpect(jsonPath("$.data.telegramUsername", is("dias_senior")))
                .andExpect(jsonPath("$.data.githubUsername", is("dias-senior-dev")))
                .andExpect(jsonPath("$.data.bio", is("Building high-throughput microservices.")))
                .andExpect(jsonPath("$.data.goal", is("Become a Senior Architect")));
    }

    @Test
    @DisplayName("PUT /v1/users/profile returns 401 Unauthorized when unauthenticated")
    void updateProfile_Unauthenticated_Returns401() throws Exception {
        UpdateUserProfileRequest request = UpdateUserProfileRequest.builder()
                .name("Hacker")
                .build();

        mockMvc.perform(put("/v1/users/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }
}