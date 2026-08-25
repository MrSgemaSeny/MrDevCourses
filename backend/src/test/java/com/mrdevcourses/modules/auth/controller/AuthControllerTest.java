package com.mrdevcourses.modules.auth.controller;

import com.mrdevcourses.modules.auth.model.Role;
import com.mrdevcourses.modules.auth.model.User;
import com.mrdevcourses.modules.auth.repository.UserRepository;
import com.mrdevcourses.modules.auth.service.JwtTokenProvider;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User testUser;
    private String validToken;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();

        testUser = User.builder()
                .email("student@mrdevcourses.com")
                .name("Murat Student")
                .avatarUrl("https://avatar.url/murat.png")
                .role(Role.STUDENT)
                .build();
        testUser = userRepository.save(testUser);

        validToken = jwtTokenProvider.generateToken(testUser);
    }

    @Test
    @DisplayName("GET /v1/auth/me should return 200 and UserDto when authenticated via cookie")
    void testGetMeAuthenticatedCookie() throws Exception {
        mockMvc.perform(get("/v1/auth/me")
                        .cookie(new Cookie("mrdevcourses_token", validToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.id", is(testUser.getId().intValue())))
                .andExpect(jsonPath("$.data.email", is("student@mrdevcourses.com")))
                .andExpect(jsonPath("$.data.name", is("Murat Student")))
                .andExpect(jsonPath("$.data.role", is("STUDENT")));
    }

    @Test
    @DisplayName("GET /v1/auth/me should return 200 and UserDto when authenticated via Authorization Bearer header")
    void testGetMeAuthenticatedBearerHeader() throws Exception {
        mockMvc.perform(get("/v1/auth/me")
                        .header("Authorization", "Bearer " + validToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.email", is("student@mrdevcourses.com")));
    }

    @Test
    @DisplayName("GET /v1/auth/me should return 401 Unauthorized when unauthenticated")
    void testGetMeUnauthenticated() throws Exception {
        mockMvc.perform(get("/v1/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)))
                .andExpect(jsonPath("$.error", is("Unauthorized")));
    }

    @Test
    @DisplayName("POST /v1/auth/logout should clear cookie with Max-Age=0")
    void testLogout() throws Exception {
        mockMvc.perform(post("/v1/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", containsString("logged out")))
                .andExpect(header().string("Set-Cookie", containsString("mrdevcourses_token=")))
                .andExpect(header().string("Set-Cookie", containsString("Max-Age=0")));
    }
}
