package com.mrdevcourses.modules.course.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseDetailDto {
    private Long id;
    private String title;
    private String description;
    private String slug;
    private boolean isActive;
    private boolean active;
    private Instant createdAt;
    private boolean isEnrolled;
    private boolean enrolled;
    private Instant enrolledAt;
    private long lessonCount;
    private long totalLessons;
    private List<CourseModuleDto> modules;

    public boolean isActive() {
        return isActive || active;
    }

    public void setActive(boolean active) {
        this.active = active;
        this.isActive = active;
    }

    public void setIsActive(boolean isActive) {
        this.isActive = isActive;
        this.active = isActive;
    }

    public boolean isEnrolled() {
        return isEnrolled || enrolled;
    }

    public void setEnrolled(boolean enrolled) {
        this.enrolled = enrolled;
        this.isEnrolled = enrolled;
    }

    public void setIsEnrolled(boolean isEnrolled) {
        this.isEnrolled = isEnrolled;
        this.enrolled = isEnrolled;
    }

    public long getLessonCount() {
        return lessonCount > 0 ? lessonCount : totalLessons;
    }

    public void setLessonCount(long lessonCount) {
        this.lessonCount = lessonCount;
        if (this.totalLessons == 0) {
            this.totalLessons = lessonCount;
        }
    }

    public long getTotalLessons() {
        return totalLessons > 0 ? totalLessons : lessonCount;
    }

    public void setTotalLessons(long totalLessons) {
        this.totalLessons = totalLessons;
        if (this.lessonCount == 0) {
            this.lessonCount = totalLessons;
        }
    }
}
