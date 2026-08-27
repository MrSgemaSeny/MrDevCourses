package com.mrdevcourses.modules.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiTutorResponse {
    private String answer;
    private String lessonTitle;
    private List<String> suggestedFollowUps;
    private boolean fallbackMode;
}
