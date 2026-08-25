package com.mrdevcourses.modules.course.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseDto {
    private Long id;
    private String title;
    private String description;
    private String slug;
    private boolean active;
    private Instant createdAt;
    private boolean enrolled;
    private Instant enrolledAt;
    private long totalLessons;
}
