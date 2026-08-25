package com.mrdevcourses.modules.audit.service;

import com.mrdevcourses.modules.audit.model.AuditLog;
import com.mrdevcourses.modules.audit.repository.AuditLogRepository;
import com.mrdevcourses.modules.auth.model.User;
import com.mrdevcourses.modules.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAction(Long userId, String action, String entityType, Long entityId, String details, String ipAddress) {
        try {
            User user = userId != null ? userRepository.findById(userId).orElse(null) : null;
            AuditLog auditLog = AuditLog.builder()
                    .user(user)
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .details(details)
                    .ipAddress(ipAddress)
                    .build();

            auditLogRepository.save(auditLog);
            log.info("[AUDIT] Action='{}' User='{}' Entity='{}:{}' IP='{}'",
                    action, (user != null ? user.getEmail() : "anonymous"), entityType, entityId, ipAddress);
        } catch (Exception e) {
            log.error("Failed to persist audit log for action: {}", action, e);
        }
    }
}
