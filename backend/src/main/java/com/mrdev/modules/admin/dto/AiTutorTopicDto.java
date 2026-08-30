package com.mrdev.modules.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiTutorTopicDto {
    private Long lessonId;
    private String lessonTitle;
    private String courseTitle;
    private long questionCount;
    private double percentage;
}
