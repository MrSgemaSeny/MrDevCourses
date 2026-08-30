package com.mrdev.modules.admin.controller;

import com.mrdev.common.dto.ApiResponse;
import com.mrdev.modules.admin.dto.*;
import com.mrdev.modules.admin.service.AdminAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
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

    @GetMapping("/ai-tutor/summary")
    public ResponseEntity<ApiResponse<AiTutorTelemetryDto>> getAiTutorSummary() {
        AiTutorTelemetryDto summary = adminAnalyticsService.getAiTutorSummary();
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/quizzes/hotspots")
    public ResponseEntity<ApiResponse<List<QuizHotspotDto>>> getQuizHotspots() {
        List<QuizHotspotDto> hotspots = adminAnalyticsService.getQuizHotspots();
        return ResponseEntity.ok(ApiResponse.success(hotspots));
    }

    @GetMapping("/export")
    public ResponseEntity<?> exportAnalytics(
            @RequestParam(required = false) Long courseId,
            @RequestParam(defaultValue = "json") String format
    ) {
        if ("csv".equalsIgnoreCase(format)) {
            String csvContent = adminAnalyticsService.exportAnalyticsCsv(courseId);
            byte[] bytes = csvContent.getBytes(StandardCharsets.UTF_8);
            String filename = "analytics-report-" + (courseId != null ? courseId : "platform") + ".csv";
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, "text/csv; charset=UTF-8")
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(bytes);
        }
        AdminAnalyticsExportDto exportDto = adminAnalyticsService.exportAnalyticsJson(courseId);
        return ResponseEntity.ok(ApiResponse.success(exportDto));
    }
}
