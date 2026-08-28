package com.mrdev.modules.automation.service;

import com.mrdev.modules.ai.rag.service.LessonIngestionService;
import com.mrdev.modules.automation.model.OutboxEvent;
import com.mrdev.modules.automation.model.OutboxStatus;
import com.mrdev.modules.automation.repository.OutboxEventRepository;
import com.mrdev.modules.lesson.repository.LessonRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OutboxProcessorTest {

    @Mock
    private OutboxEventRepository outboxEventRepository;

    @Mock
    private LessonIngestionService lessonIngestionService;

    @Mock
    private SemanticLinkingService semanticLinkingService;

    @Mock
    private LessonRepository lessonRepository;

    @InjectMocks
    private OutboxProcessor outboxProcessor;

    @Test
    @DisplayName("processPendingEvents handles COURSE_INGESTION_REQUESTED event and marks COMPLETED")
    void processPendingEvents_ProcessesSuccessfully() {
        OutboxEvent event = OutboxEvent.builder()
                .id(1L)
                .aggregateType("COURSE")
                .aggregateId(42L)
                .eventType("COURSE_INGESTION_REQUESTED")
                .status(OutboxStatus.PENDING)
                .retryCount(0)
                .build();

        when(outboxEventRepository.findTop50ByStatusOrderByCreatedAtAsc(OutboxStatus.PENDING))
                .thenReturn(List.of(event));

        outboxProcessor.processPendingEvents();

        verify(lessonIngestionService).ingestAllCourseLessons(42L);
        verify(semanticLinkingService).syncGlossaryEmbeddings(42L);
        assertThat(event.getStatus()).isEqualTo(OutboxStatus.COMPLETED);
        verify(outboxEventRepository).save(event);
    }
}
