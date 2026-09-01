package com.mrdev.modules.automation.service;

import com.mrdev.modules.auth.model.Role;
import com.mrdev.modules.auth.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

@ExtendWith(MockitoExtension.class)
class EmailNotificationServiceTest {

    @Mock
    private JavaMailSender mailSender;

    private EmailNotificationService emailService;
    private User testStudent;

    @BeforeEach
    void setUp() {
        emailService = new EmailNotificationService(
                mailSender,
                "no-reply@mrdev.pro",
                "http://localhost:5173",
                "mentor@mrdev.pro"
        );

        testStudent = User.builder()
                .id(1L)
                .name("Alex")
                .email("alex@test.com")
                .role(Role.STUDENT)
                .emailNotificationsEnabled(true)
                .build();
    }

    @Test
    @DisplayName("sendWelcomeEmail executes without exception in mock environment")
    void sendWelcomeEmail_Success() {
        assertDoesNotThrow(() -> emailService.sendWelcomeEmail(testStudent));
    }

    @Test
    @DisplayName("sendHomeworkReviewedEmail executes without exception")
    void sendHomeworkReviewedEmail_Success() {
        assertDoesNotThrow(() -> emailService.sendHomeworkReviewedEmail(
                testStudent, "Fullstack Bootcamp", "Day 1 Setup", true, "Good job!"));
    }

    @Test
    @DisplayName("sendLessonUnlockedEmail executes without exception")
    void sendLessonUnlockedEmail_Success() {
        assertDoesNotThrow(() -> emailService.sendLessonUnlockedEmail(
                testStudent, "Fullstack Bootcamp", "Day 2 Docker", 2));
    }

    @Test
    @DisplayName("sendSosMentorAlertEmail executes without exception")
    void sendSosMentorAlertEmail_Success() {
        assertDoesNotThrow(() -> emailService.sendSosMentorAlertEmail(
                "Alex", "alex@test.com", "Fullstack Bootcamp", "Day 1 Setup", "Port 5432 error", "Bind exception"));
    }

    @Test
    @DisplayName("sendInactivityNudgeEmail executes without exception")
    void sendInactivityNudgeEmail_Success() {
        assertDoesNotThrow(() -> emailService.sendInactivityNudgeEmail(
                testStudent, 3, "Day 3 REST APIs"));
    }
}