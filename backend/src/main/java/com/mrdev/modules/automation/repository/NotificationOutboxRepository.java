package com.mrdev.modules.automation.repository;

import com.mrdev.modules.automation.model.NotificationOutbox;
import com.mrdev.modules.automation.model.OutboxStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface NotificationOutboxRepository extends JpaRepository<NotificationOutbox, Long> {

    @Query("SELECT o FROM NotificationOutbox o WHERE o.status = :status AND o.nextRetryAt <= :now ORDER BY o.nextRetryAt ASC")
    List<NotificationOutbox> findPendingToProcess(@Param("status") OutboxStatus status, @Param("now") Instant now, Pageable pageable);
}