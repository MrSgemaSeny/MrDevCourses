package com.mrdev.modules.help.controller;

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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TelegramLinkControllerTest {

    @Autowired
    private MockMvc mockMvc;

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
                .name("Alex Student")
                .email("alex.link." + suffix + "@test.com")
                .role(Role.STUDENT)
                .build());
        studentToken = jwtTokenProvider.generateToken(student);
    }

    @Test
    @DisplayName("POST /v1/telegram/link-token generates link token for authenticated user")
    void generateLinkToken_Success() throws Exception {
        mockMvc.perform(post("/v1/telegram/link-token")
                        .cookie(new Cookie("MrDev_token", studentToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.linkUrl", containsString("t.me/")));
    }

    @Test
    @DisplayName("DELETE /v1/telegram/unlink removes telegram connection")
    void unlinkTelegram_Success() throws Exception {
        mockMvc.perform(delete("/v1/telegram/unlink")
                        .cookie(new Cookie("MrDev_token", studentToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }
}