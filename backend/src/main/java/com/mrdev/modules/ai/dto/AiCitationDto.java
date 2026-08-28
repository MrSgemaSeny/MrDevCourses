package com.mrdev.modules.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiCitationDto {
    private Long chunkId;
    private String header;
    private String snippet;
    private double relevanceScore;
}
