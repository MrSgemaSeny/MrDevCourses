package com.mrdev.modules.help.dto;

import com.mrdev.modules.help.model.HelpRequestStatus;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HelpRequestDto {
    private Long id;
    private Long userId;
    private String studentName;
    private String studentEmail;
    private Long courseId;
    private String courseTitle;
    private Long lessonId;
    private String lessonTitle;
    private Integer lessonDayNumber;
    private String stepIdentifier;
    private String stepTitle;
    private String problemText;
    private String errorLogs;
    private HelpRequestStatus status;
    private String mentorSolution;
    private Long resolvedBy;
    private Instant resolvedAt;
    private Instant createdAt;
}
