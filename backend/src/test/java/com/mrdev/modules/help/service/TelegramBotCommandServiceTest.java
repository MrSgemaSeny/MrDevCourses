package com.mrdev.modules.help.service;

import com.mrdev.modules.auth.model.Role;
import com.mrdev.modules.auth.model.User;
import com.mrdev.modules.auth.repository.UserRepository;
import com.mrdev.modules.course.repository.CourseRepository;
import com.mrdev.modules.course.repository.EnrollmentRepository;
import com.mrdev.modules.homework.service.HomeworkService;
import com.mrdev.modules.lesson.repository.LessonProgressRepository;
import com.mrdev.modules.lesson.repository.LessonRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TelegramBotCommandServiceTest {

    @Mock
    private HomeworkService homeworkService;
    @Mock
    private UserRepository userRepository;
    @Mock
    private EnrollmentRepository enrollmentRepository;
    @Mock
    private LessonProgressRepository lessonProgressRepository;
    @Mock
    private LessonRepository lessonRepository;
    @Mock
    private CourseRepository courseRepository;
    @Mock
    private TelegramNotificationService telegramNotificationService;
    @Mock
    private TelegramLinkTokenService linkTokenService;

    private TelegramBotCommandService botCommandService;
    private final String mentorChatId = "123456789";

    @BeforeEach
    void setUp() {
        botCommandService = new TelegramBotCommandService(
                homeworkService,
                userRepository,
                enrollmentRepository,
                lessonProgressRepository,
                lessonRepository,
                courseRepository,
                telegramNotificationService,
                linkTokenService,
                mentorChatId
        );
    }

    @Test
    @DisplayName("Mentor /help returns available mentor commands")
    void mentorHelp_ReturnsCommandList() {
        String response = botCommandService.processCommand(mentorChatId, "/help");
        assertThat(response).contains("Пульт Ментора").contains("/hw").contains("/approve").contains("/progress");
    }

    @Test
    @DisplayName("Mentor /hw with empty queue returns clear message")
    void mentorHw_EmptyQueue() {
        when(homeworkService.getAllSubmissions(any())).thenReturn(List.of());
        String response = botCommandService.processCommand(mentorChatId, "/hw");
        assertThat(response).contains("Очередь ДЗ пуста");
    }

    @Test
    @DisplayName("Mentor /progress for existing student returns student card")
    void mentorProgress_FoundStudent() {
        User student = User.builder()
                .id(1L)
                .name("Alex Student")
                .email("alex@test.com")
                .telegramUsername("alex_tg")
                .currentStreak(5)
                .longestStreak(10)
                .build();

        when(userRepository.findByEmailIgnoreCase("alex@test.com")).thenReturn(Optional.of(student));
        when(enrollmentRepository.findAllByUserId(1L)).thenReturn(List.of());

        String response = botCommandService.processCommand(mentorChatId, "/progress alex@test.com");
        assertThat(response).contains("Alex Student").contains("alex@test.com").contains("alex_tg");
    }

    @Test
    @DisplayName("Student /start LINK_<token> associates telegram chat id")
    void studentLink_Success() {
        User student = User.builder()
                .id(2L)
                .email("student@test.com")
                .role(Role.STUDENT)
                .build();

        when(linkTokenService.validateAndConsumeToken("abc123token")).thenReturn(2L);
        when(userRepository.findById(2L)).thenReturn(Optional.of(student));
        when(userRepository.save(any(User.class))).thenReturn(student);

        String response = botCommandService.processCommand("987654321", "/start LINK_abc123token");
        assertThat(response).contains("Telegram-аккаунт успешно привязан");
    }
}