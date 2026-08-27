package com.mrdevcourses.modules.admin.controller;

import com.mrdevcourses.common.dto.ApiResponse;
import com.mrdevcourses.modules.admin.dto.AdminOverviewMetricsDto;
import com.mrdevcourses.modules.admin.dto.CourseFunnelStepDto;
import com.mrdevcourses.modules.admin.dto.CourseRetentionDto;
import com.mrdevcourses.modules.admin.dto.StreakDistributionDto;
import com.mrdevcourses.modules.admin.service.AdminAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/v1/admin/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminAnalyticsController {

    private final AdminAnalyticsService adminAnalyticsService;

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<AdminOverviewMetricsDto>> getOverviewMetrics() {
        AdminOverviewMetricsDto metrics = adminAnalyticsService.getOverviewMetrics();
        return ResponseEntity.ok(ApiResponse.success(metrics));
    }

    @GetMapping("/courses/{courseId}/funnel")
    public ResponseEntity<ApiResponse<List<CourseFunnelStepDto>>> getCourseFunnel(@PathVariable Long courseId) {
        List<CourseFunnelStepDto> funnel = adminAnalyticsService.getCourseFunnel(courseId);
        return ResponseEntity.ok(ApiResponse.success(funnel));
    }

    @GetMapping("/streaks")
    public ResponseEntity<ApiResponse<List<StreakDistributionDto>>> getStreakDistribution() {
        List<StreakDistributionDto> streaks = adminAnalyticsService.getStreakDistribution();
        return ResponseEntity.ok(ApiResponse.success(streaks));
    }

    @GetMapping("/courses/{courseId}/retention")
    public ResponseEntity<ApiResponse<CourseRetentionDto>> getCourseRetention(@PathVariable Long courseId) {
        CourseRetentionDto retention = adminAnalyticsService.getCourseRetention(courseId);
        return ResponseEntity.ok(ApiResponse.success(retention));
    }
}
