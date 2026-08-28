package com.mrdev.modules.automation.service;

import com.mrdev.modules.ai.rag.service.LessonIngestionService;
import com.mrdev.modules.automation.model.OutboxEvent;
import com.mrdev.modules.automation.model.OutboxStatus;
import com.mrdev.modules.automation.repository.OutboxEventRepository;
import com.mrdev.modules.lesson.model.Lesson;
import com.mrdev.modules.lesson.repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class OutboxProcessor {

    private final OutboxEventRepository outboxEventRepository;
    private final LessonIngestionService lessonIngestionService;
    private final SemanticLinkingService semanticLinkingService;
    private final LessonRepository lessonRepository;

    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void processPendingEvents() {
        List<OutboxEvent> pendingEvents = outboxEventRepository.findTop50ByStatusOrderByCreatedAtAsc(OutboxStatus.PENDING);
        if (pendingEvents.isEmpty()) {
            return;
        }

        log.debug("Processing {} pending outbox events", pendingEvents.size());

        for (OutboxEvent event : pendingEvents) {
            try {
                event.setStatus(OutboxStatus.PROCESSING);
                handleEvent(event);
                event.setStatus(OutboxStatus.COMPLETED);
                event.setProcessedAt(Instant.now());
                event.setErrorMessage(null);
            } catch (Exception e) {
                log.error("Failed processing outbox event id={}, type={}: {}", event.getId(), event.getEventType(), e.getMessage(), e);
                event.setRetryCount(event.getRetryCount() + 1);
                event.setErrorMessage(e.getMessage());
                if (event.getRetryCount() >= 3) {
                    event.setStatus(OutboxStatus.FAILED);
                } else {
                    event.setStatus(OutboxStatus.PENDING);
                }
            }
            outboxEventRepository.save(event);
        }
    }

    private void handleEvent(OutboxEvent event) {
        switch (event.getEventType()) {
            case "LESSON_INGESTION_REQUESTED", "LESSON_UPDATED" -> {
                Lesson lesson = lessonRepository.findById(event.getAggregateId()).orElse(null);
                if (lesson != null) {
                    lessonIngestionService.ingestLesson(lesson);
                }
            }
            case "COURSE_INGESTION_REQUESTED" -> {
                lessonIngestionService.ingestAllCourseLessons(event.getAggregateId());
                semanticLinkingService.syncGlossaryEmbeddings(event.getAggregateId());
            }
            case "GLOSSARY_SYNC_REQUESTED" -> {
                semanticLinkingService.syncGlossaryEmbeddings(event.getAggregateId());
            }
            default -> log.info("Unhandled event type: {}", event.getEventType());
        }
    }
}
