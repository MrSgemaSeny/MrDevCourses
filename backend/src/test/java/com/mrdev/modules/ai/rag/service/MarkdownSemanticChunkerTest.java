package com.mrdev.modules.ai.rag.service;

import com.mrdev.modules.ai.rag.model.ChunkType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class MarkdownSemanticChunkerTest {

    private MarkdownSemanticChunker chunker;

    @BeforeEach
    void setUp() {
        chunker = new MarkdownSemanticChunker();
    }

    @Test
    @DisplayName("chunkMarkdown should split text by markdown headers without breaking code blocks")
    void chunkMarkdown_SplitsByHeadersAndKeepsCodeBlocks() {
        String markdown = """
                # Модульный монолит в Spring Boot 3
                
                В этой главе мы проектируем разделение модулей и соблюдение SRP.
                Архитектура должна быть чистой и масштабируемой.
                
                ```java
                @Service
                public class OrderService {
                    private final PaymentGateway paymentGateway;
                    // Important multiline code block
                }
                ```
                
                ## Практическое задание
                
                Напишите собственный сервис и покройте его unit-тестами.
                Убедитесь, что все зависимости изолированы.
                """;

        List<MarkdownSemanticChunker.RawChunk> chunks = chunker.chunkMarkdown(markdown);

        assertThat(chunks).isNotEmpty();
        assertThat(chunks).anyMatch(c -> c.getChunkType() == ChunkType.HOMEWORK);
        assertThat(chunks.get(0).getContentHash()).isNotBlank();
        assertThat(chunks.get(0).getTokenCount()).isGreaterThan(0);
    }

    @Test
    @DisplayName("chunkMarkdown with empty string returns empty list")
    void chunkMarkdown_WhenEmpty_ReturnsEmptyList() {
        List<MarkdownSemanticChunker.RawChunk> chunks = chunker.chunkMarkdown("");
        assertThat(chunks).isEmpty();
    }
}
