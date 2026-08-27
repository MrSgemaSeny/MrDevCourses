package com.mrdevcourses.modules.homework.dto;

import com.mrdevcourses.modules.homework.model.SubmissionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HomeworkSubmissionDto {
    private Long id;
    private Long lessonId;
    private Long userId;
    private Long courseId;
    private String codeSnippet;
    private String repositoryUrl;
    private SubmissionStatus status;
    private Integer score;
    private String aiFeedback;
    private Integer passedTestsCount;
    private Integer totalTestsCount;
    private String securityFlags;
    private Instant reviewedAt;
    private Instant createdAt;
}
