package com.mrdev.modules.ai.rag.service;

import com.mrdev.modules.ai.rag.model.ChunkType;
import lombok.Builder;
import lombok.Getter;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;

@Component
public class MarkdownSemanticChunker {

    private static final int MAX_CHUNK_CHAR_LENGTH = 1600;
    private static final int MIN_CHUNK_CHAR_LENGTH = 150;

    @Getter
    @Builder
    public static class RawChunk {
        private final int chunkIndex;
        private final ChunkType chunkType;
        private final String header;
        private final String content;
        private final int tokenCount;
        private final String contentHash;
    }

    public List<RawChunk> chunkMarkdown(String markdown) {
        if (markdown == null || markdown.isBlank()) {
            return List.of();
        }

        List<RawChunk> chunks = new ArrayList<>();
        String[] lines = markdown.split("\\r?\\n");

        StringBuilder currentChunk = new StringBuilder();
        String currentHeader = "Введение";
        boolean inCodeBlock = false;
        int chunkIndex = 0;

        for (String line : lines) {
            String trimmed = line.trim();

            if (trimmed.startsWith("```")) {
                inCodeBlock = !inCodeBlock;
            }

            // Boundary detected: Heading outside code block, and current buffer is large enough
            if (!inCodeBlock && trimmed.startsWith("#") && currentChunk.length() >= MIN_CHUNK_CHAR_LENGTH) {
                // Flush existing chunk
                String content = currentChunk.toString().trim();
                if (!content.isBlank()) {
                    chunks.add(createRawChunk(chunkIndex++, currentHeader, content));
                    currentChunk.setLength(0);
                }

                // Extract new header name
                currentHeader = trimmed.replaceFirst("^#+\\s*", "");
            }

            currentChunk.append(line).append("\n");

            // If chunk exceeds max size and we are not in the middle of code
            if (!inCodeBlock && currentChunk.length() >= MAX_CHUNK_CHAR_LENGTH) {
                String content = currentChunk.toString().trim();
                if (!content.isBlank()) {
                    chunks.add(createRawChunk(chunkIndex++, currentHeader, content));
                    currentChunk.setLength(0);
                }
            }
        }

        // Flush remaining content
        String remaining = currentChunk.toString().trim();
        if (!remaining.isBlank()) {
            chunks.add(createRawChunk(chunkIndex, currentHeader, remaining));
        }

        return chunks;
    }

    private RawChunk createRawChunk(int index, String header, String content) {
        ChunkType type = detectChunkType(header, content);
        int tokenCount = approximateTokenCount(content);
        String hash = computeSha256(content);

        return RawChunk.builder()
                .chunkIndex(index)
                .chunkType(type)
                .header(header)
                .content(content)
                .tokenCount(tokenCount)
                .contentHash(hash)
                .build();
    }

    private ChunkType detectChunkType(String header, String content) {
        String lowerHeader = header != null ? header.toLowerCase() : "";
        String lowerContent = content.toLowerCase();

        if (lowerHeader.contains("задание") || lowerHeader.contains("homework") || lowerHeader.contains("практика")) {
            return ChunkType.HOMEWORK;
        }
        if (lowerHeader.contains("термин") || lowerHeader.contains("глоссарий") || lowerHeader.contains("glossary")) {
            return ChunkType.GLOSSARY;
        }
        if (content.contains("```java") || content.contains("```typescript") || content.contains("```sql") || content.contains("```json")) {
            return ChunkType.CODE;
        }
        return ChunkType.THEORY;
    }

    private int approximateTokenCount(String text) {
        if (text == null || text.isBlank()) {
            return 0;
        }
        String[] words = text.split("\\s+");
        return (int) Math.ceil(words.length * 1.35);
    }

    public String computeSha256(String text) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(text.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }
}
