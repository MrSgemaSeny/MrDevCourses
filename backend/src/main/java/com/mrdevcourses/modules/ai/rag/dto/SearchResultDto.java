package com.mrdevcourses.modules.ai.rag.dto;

import com.mrdevcourses.modules.ai.rag.model.ChunkType;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SearchResultDto {
    private final Long chunkId;
    private final Long lessonId;
    private final Long courseId;
    private final String header;
    private final String content;
    private final ChunkType chunkType;
    private final double score;
    private final String matchType;
}
