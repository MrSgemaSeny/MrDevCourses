package com.mrdev.modules.automation.service;

import com.mrdev.modules.audit.service.AuditService;
import com.mrdev.modules.auth.model.Role;
import com.mrdev.modules.auth.model.User;
import com.mrdev.modules.automation.dto.StuckStudentAlertDto;
import com.mrdev.modules.course.model.Course;
import com.mrdev.modules.course.model.Enrollment;
import com.mrdev.modules.course.repository.EnrollmentRepository;
import com.mrdev.modules.help.service.TelegramNotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StuckDetectionServiceTest {

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private com.mrdev.modules.auth.repository.UserRepository userRepository;

    @Mock
    private TelegramNotificationService telegramNotificationService;

    @Mock
    private EmailNotificationService emailNotificationService;

    @Mock
    private AuditService auditService;

    private StuckDetectionService stuckDetectionService;

    @BeforeEach
    void setUp() {
        stuckDetectionService = new StuckDetectionService(
                enrollmentRepository,
                userRepository,
                telegramNotificationService,
                emailNotificationService,
                auditService
        );
    }

    @Test
    @DisplayName("Should detect inactive student (4 days ago) and send alert to mentor")
    void detectStuckStudents_SendsAlertForInactiveStudent() {
        User activeStudent = User.builder()
                .id(1L)
                .name("Active Alex")
                .email("alex@test.com")
                .role(Role.STUDENT)
                .lastActiveDate(LocalDate.now().minusDays(1))
                .build();

        User stuckStudent = User.builder()
                .id(2L)
                .name("Stuck Sam")
                .email("sam@test.com")
                .role(Role.STUDENT)
                .lastActiveDate(LocalDate.now().minusDays(4))
                .build();

        Course course = Course.builder().id(10L).title("Вайбкодинг: Первый сайт").build();

        Enrollment e1 = Enrollment.builder().user(activeStudent).course(course).enrolledAt(Instant.now()).build();
        Enrollment e2 = Enrollment.builder().user(stuckStudent).course(course).enrolledAt(Instant.now().minusSeconds(86400 * 5)).build();

        when(enrollmentRepository.findAll()).thenReturn(List.of(e1, e2));

        List<StuckStudentAlertDto> result = stuckDetectionService.runStuckCheck();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStudentName()).isEqualTo("Stuck Sam");
        assertThat(result.get(0).getDaysInactive()).isEqualTo(4);

        verify(telegramNotificationService).sendMentorAlert(contains("Stuck Alert"), contains("Stuck Sam"));
        verify(auditService).logAction(eq(2L), eq("STUCK_STUDENT_DETECTED"), eq("User"), eq(2L), anyString(), isNull());
    }

    @Test
    @DisplayName("Should return empty list when all students are active")
    void detectStuckStudents_NoStuckStudents_NoAlerts() {
        User activeStudent = User.builder()
                .id(1L)
                .name("Active User")
                .email("active@test.com")
                .role(Role.STUDENT)
                .lastActiveDate(LocalDate.now())
                .build();

        Course course = Course.builder().id(10L).title("Вайбкодинг").build();
        Enrollment e = Enrollment.builder().user(activeStudent).course(course).build();

        when(enrollmentRepository.findAll()).thenReturn(List.of(e));

        List<StuckStudentAlertDto> result = stuckDetectionService.runStuckCheck();

        assertThat(result).isEmpty();
        verifyNoInteractions(telegramNotificationService);
    }
}
