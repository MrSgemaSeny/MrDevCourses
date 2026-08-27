package com.mrdevcourses.modules.course.dto;

import com.mrdevcourses.modules.lesson.dto.LessonSummaryDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseModuleDto {
    private Long id;
    private Long courseId;
    private String title;
    private String description;
    private Integer sortOrder;
    private boolean isFreePreview;
    private Integer lessonsCount;
    private Integer completedLessonsCount;
    private List<LessonSummaryDto> lessons;
}
