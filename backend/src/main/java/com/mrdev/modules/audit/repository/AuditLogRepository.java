package com.mrdev.modules.audit.repository;

import com.mrdev.modules.audit.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<AuditLog> findTop50ByOrderByCreatedAtDesc();
    List<AuditLog> findByAction(String action);
    List<AuditLog> findByActionIn(List<String> actions);
    long countByAction(String action);
}
