package com.mrdev.modules.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CohortDto {
    private Long id;
    private Long courseId;
    private String courseTitle;
    private String courseSlug;
    private String name;
    private Instant startDate;
    private Instant endDate;
    private Integer maxStudents;
    private long currentStudentsCount;
    private Boolean isActive;
    private Instant createdAt;
}
