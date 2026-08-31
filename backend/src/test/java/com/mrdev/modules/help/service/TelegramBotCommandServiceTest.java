package com.mrdev.modules.help.service;

import com.mrdev.modules.auth.model.Role;
import com.mrdev.modules.auth.model.User;
import com.mrdev.modules.auth.repository.UserRepository;
import com.mrdev.modules.course.model.Course;
import com.mrdev.modules.course.model.Enrollment;
import com.mrdev.modules.course.repository.CourseRepository;
import com.mrdev.modules.course.repository.EnrollmentRepository;
import com.mrdev.modules.homework.dto.AdminReviewHomeworkRequest;
import com.mrdev.modules.homework.dto.HomeworkSubmissionDto;
import com.mrdev.modules.homework.model.SubmissionStatus;
import com.mrdev.modules.homework.service.HomeworkService;
import com.mrdev.modules.lesson.model.Lesson;
import com.mrdev.modules.lesson.model.LessonProgress;
import com.mrdev.modules.lesson.repository.LessonProgressRepository;
import com.mrdev.modules.lesson.repository.LessonRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

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

    private TelegramBotCommandService commandService;
    private final String authorizedChatId = "5029600728";

    @BeforeEach
    void setUp() {
        commandService = new TelegramBotCommandService(
                homeworkService,
                userRepository,
                enrollmentRepository,
                lessonProgressRepository,
                lessonRepository,
                courseRepository,
                telegramNotificationService,
                authorizedChatId
        );
    }

    @Test
    @DisplayName("Reject commands from unauthorized chat ID")
    void handleCommand_UnauthorizedChat_Ignored() {
        String response = commandService.processCommand("99999999", "/hw");
        assertThat(response).isNull();
        verifyNoInteractions(homeworkService);
    }

    @Test
    @DisplayName("/hw returns formatted pending submissions list")
    void handleCommand_Hw_WithPendingSubmissions() {
        HomeworkSubmissionDto sub = HomeworkSubmissionDto.builder()
                .id(101L)
                .studentName("Azamat")
                .lessonTitle("Урок 1: Вайбкодинг")
                .repositoryUrl("https://github.com/azamat/hw1")
                .liveDemoUrl("https://azamat-hw.vercel.app")
                .createdAt(Instant.now())
                .build();

        when(homeworkService.getAllSubmissions(SubmissionStatus.PENDING)).thenReturn(List.of(sub));

        String response = commandService.processCommand(authorizedChatId, "/hw");

        assertThat(response).contains("Очередь ДЗ на проверку (1)");
        assertThat(response).contains("ID: #101");
        assertThat(response).contains("Azamat");
        assertThat(response).contains("https://github.com/azamat/hw1");
        assertThat(response).contains("https://azamat-hw.vercel.app");
        assertThat(response).contains("/approve 101");
    }

    @Test
    @DisplayName("/hw when empty returns clean message")
    void handleCommand_Hw_EmptyQueue() {
        when(homeworkService.getAllSubmissions(SubmissionStatus.PENDING)).thenReturn(List.of());

        String response = commandService.processCommand(authorizedChatId, "/hw");

        assertThat(response).contains("Очередь ДЗ пуста! Все работы проверены.");
    }

    @Test
    @DisplayName("/approve <id> approves submission and unlocks lesson")
    void handleCommand_Approve_Success() {
        User adminUser = User.builder().id(1L).email("admin@mrdev.com").role(Role.ADMIN).build();
        when(userRepository.findAllByRole(Role.ADMIN)).thenReturn(List.of(adminUser));

        HomeworkSubmissionDto updated = HomeworkSubmissionDto.builder()
                .id(101L)
                .status(SubmissionStatus.PASSED)
                .build();
        when(homeworkService.reviewSubmission(eq(101L), eq(1L), any(AdminReviewHomeworkRequest.class)))
                .thenReturn(updated);

        String response = commandService.processCommand(authorizedChatId, "/approve 101");

        assertThat(response).contains("✅ ДЗ #101 успешно принято!");
        ArgumentCaptor<AdminReviewHomeworkRequest> captor = ArgumentCaptor.forClass(AdminReviewHomeworkRequest.class);
        verify(homeworkService).reviewSubmission(eq(101L), eq(1L), captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(SubmissionStatus.PASSED);
    }

    @Test
    @DisplayName("/reject <id> <comment> sets submission to NEEDS_IMPROVEMENT with feedback")
    void handleCommand_Reject_Success() {
        User adminUser = User.builder().id(1L).email("admin@mrdev.com").role(Role.ADMIN).build();
        when(userRepository.findAllByRole(Role.ADMIN)).thenReturn(List.of(adminUser));

        HomeworkSubmissionDto updated = HomeworkSubmissionDto.builder()
                .id(101L)
                .status(SubmissionStatus.NEEDS_IMPROVEMENT)
                .build();
        when(homeworkService.reviewSubmission(eq(101L), eq(1L), any(AdminReviewHomeworkRequest.class)))
                .thenReturn(updated);

        String response = commandService.processCommand(authorizedChatId, "/reject 101 Поправь мобильную верстку");

        assertThat(response).contains("⚠️ ДЗ #101 отправлено на доработку");
        ArgumentCaptor<AdminReviewHomeworkRequest> captor = ArgumentCaptor.forClass(AdminReviewHomeworkRequest.class);
        verify(homeworkService).reviewSubmission(eq(101L), eq(1L), captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(SubmissionStatus.NEEDS_IMPROVEMENT);
        assertThat(captor.getValue().getMentorFeedback()).isEqualTo("Поправь мобильную верстку");
    }

    @Test
    @DisplayName("/status returns student progress overview")
    void handleCommand_Status_Success() {
        User student = User.builder().id(10L).name("Murat").email("murat@test.com").role(Role.STUDENT).currentStreak(3).build();
        Course course = Course.builder().id(1L).title("Вайбкодинг").build();
        Enrollment enrollment = Enrollment.builder().user(student).course(course).enrolledAt(Instant.now()).build();

        when(enrollmentRepository.findAll()).thenReturn(List.of(enrollment));
        when(lessonRepository.countByCourseId(1L)).thenReturn(5L);
        when(lessonProgressRepository.countCompletedLessonsByUserIdAndCourseId(10L, 1L)).thenReturn(2L);

        String response = commandService.processCommand(authorizedChatId, "/status");

        assertThat(response).contains("Сводка студентов потока");
        assertThat(response).contains("Murat");
        assertThat(response).contains("2/5 уроков (40%)");
    }

    @Test
    @DisplayName("/stuck finds students inactive for 3+ days")
    void handleCommand_Stuck_Success() {
        User activeStudent = User.builder().id(10L).name("Active").lastActiveDate(LocalDate.now()).build();
        User stuckStudent = User.builder().id(11L).name("Stuck Alex").email("alex@test.com").lastActiveDate(LocalDate.now().minusDays(4)).build();
        Course course = Course.builder().id(1L).title("Вайбкодинг").build();

        Enrollment e1 = Enrollment.builder().user(activeStudent).course(course).build();
        Enrollment e2 = Enrollment.builder().user(stuckStudent).course(course).build();

        when(enrollmentRepository.findAll()).thenReturn(List.of(e1, e2));

        String response = commandService.processCommand(authorizedChatId, "/stuck");

        assertThat(response).contains("Застрявшие студенты (3+ дня без активности)");
        assertThat(response).contains("Stuck Alex");
        assertThat(response).contains("alex@test.com");
    }
}
