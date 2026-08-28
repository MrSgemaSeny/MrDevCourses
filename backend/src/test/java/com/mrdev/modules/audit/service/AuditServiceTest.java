package com.mrdev.modules.audit.service;

import com.mrdev.modules.audit.model.AuditLog;
import com.mrdev.modules.audit.repository.AuditLogRepository;
import com.mrdev.modules.auth.model.Role;
import com.mrdev.modules.auth.model.User;
import com.mrdev.modules.auth.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuditServiceTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AuditService auditService;

    @Test
    void logAction_WhenUserExists_ShouldSaveAuditLog() {
        User user = User.builder().id(1L).email("audit@test.com").role(Role.STUDENT).build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        auditService.logAction(1L, "COURSE_ENROLL", "Course", 100L, "Enrolled", "127.0.0.1");

        verify(auditLogRepository).save(any(AuditLog.class));
    }
}
