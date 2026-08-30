package com.mrdev.modules.admin.dto;

import com.mrdev.modules.homework.model.SubmissionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentHomeworkStatusDto {
    private Long submissionId;
    private Long lessonId;
    private String lessonTitle;
    private Long courseId;
    private String courseTitle;
    private String codeSnippet;
    private String repositoryUrl;
    private SubmissionStatus status;
    private Integer score;
    private String aiFeedback;
    private Integer passedTestsCount;
    private Integer totalTestsCount;
    private Instant reviewedAt;
    private Instant createdAt;
}
