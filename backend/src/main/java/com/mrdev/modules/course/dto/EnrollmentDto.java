package com.mrdev.modules.course.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentDto {
    private Long id;
    private Long userId;
    private String userEmail;
    private String userName;
    private Long courseId;
    private String courseTitle;
    private String courseSlug;
    private Instant enrolledAt;
}
