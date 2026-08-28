package com.mrdev.modules.ai.rag.service;

import com.mrdev.modules.ai.rag.model.LessonChunk;
import com.mrdev.modules.ai.rag.repository.LessonChunkRepository;
import com.mrdev.modules.lesson.model.Lesson;
import com.mrdev.modules.lesson.repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class LessonIngestionService {

    private final LessonChunkRepository lessonChunkRepository;
    private final LessonRepository lessonRepository;
    private final MarkdownSemanticChunker chunker;
    private final EmbeddingService embeddingService;

    @Transactional
    public List<LessonChunk> ingestLesson(Lesson lesson) {
        if (lesson == null || lesson.getContent() == null || lesson.getContent().isBlank()) {
            return List.of();
        }

        log.info("Starting semantic ingestion for lesson id={} ('{}')", lesson.getId(), lesson.getTitle());

        // 1. Remove previous chunks
        lessonChunkRepository.deleteByLessonId(lesson.getId());

        // 2. Chunk markdown
        List<MarkdownSemanticChunker.RawChunk> rawChunks = chunker.chunkMarkdown(lesson.getContent());
        List<LessonChunk> savedChunks = new ArrayList<>();

        // 3. Generate embeddings & map entities
        for (MarkdownSemanticChunker.RawChunk raw : rawChunks) {
            float[] embeddingVec = embeddingService.generateEmbedding(raw.getHeader() + " " + raw.getContent());
            String embeddingStr = embeddingService.vectorToString(embeddingVec);

            LessonChunk chunk = LessonChunk.builder()
                    .lessonId(lesson.getId())
                    .courseId(lesson.getCourse().getId())
                    .chunkIndex(raw.getChunkIndex())
                    .chunkType(raw.getChunkType())
                    .header(raw.getHeader())
                    .content(raw.getContent())
                    .tokenCount(raw.getTokenCount())
                    .contentHash(raw.getContentHash())
                    .embedding(embeddingStr)
                    .build();

            savedChunks.add(chunk);
        }

        List<LessonChunk> persisted = lessonChunkRepository.saveAll(savedChunks);
        log.info("Successfully ingested {} chunks for lesson id={}", persisted.size(), lesson.getId());
        return persisted;
    }

    @Transactional
    public int ingestAllCourseLessons(Long courseId) {
        List<Lesson> lessons = lessonRepository.findByCourseIdOrderBySortOrderAscDayNumberAsc(courseId);
        int totalChunks = 0;
        for (Lesson lesson : lessons) {
            List<LessonChunk> chunks = ingestLesson(lesson);
            totalChunks += chunks.size();
        }
        log.info("Completed course ingestion for courseId={}, totalChunks={}", courseId, totalChunks);
        return totalChunks;
    }
}
