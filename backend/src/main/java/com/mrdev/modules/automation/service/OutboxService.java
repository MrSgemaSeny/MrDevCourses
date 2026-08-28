package com.mrdev.modules.automation.service;

import com.mrdev.modules.automation.model.OutboxEvent;
import com.mrdev.modules.automation.model.OutboxStatus;
import com.mrdev.modules.automation.repository.OutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class OutboxService {

    private final OutboxEventRepository outboxEventRepository;

    @Transactional
    public OutboxEvent publishEvent(String aggregateType, Long aggregateId, String eventType, String payload) {
        OutboxEvent event = OutboxEvent.builder()
                .aggregateType(aggregateType)
                .aggregateId(aggregateId)
                .eventType(eventType)
                .payload(payload != null ? payload : "{}")
                .status(OutboxStatus.PENDING)
                .retryCount(0)
                .build();

        event = outboxEventRepository.save(event);
        log.debug("Recorded outbox event id={}, type={}, aggregateId={}", event.getId(), eventType, aggregateId);
        return event;
    }
}
