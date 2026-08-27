package com.mrdevcourses.modules.automation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SemanticLinkDto {
    private String term;
    private String category;
    private String definition;
    private double similarityScore;
    private String previewSnippet;
}
