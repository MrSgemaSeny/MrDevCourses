package com.mrdevcourses.modules.automation.controller;

import com.mrdevcourses.common.dto.ApiResponse;
import com.mrdevcourses.modules.automation.dto.SemanticLinkDto;
import com.mrdevcourses.modules.automation.dto.StudentRiskDto;
import com.mrdevcourses.modules.automation.model.OutboxStatus;
import com.mrdevcourses.modules.automation.repository.OutboxEventRepository;
import com.mrdevcourses.modules.automation.service.OutboxService;
import com.mrdevcourses.modules.automation.service.SemanticLinkingService;
import com.mrdevcourses.modules.automation.service.StudentLifecycleService;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1")
@RequiredArgsConstructor
public class AutomationAdminController {

    private final OutboxEventRepository outboxEventRepository;
    private final OutboxService outboxService;
    private final StudentLifecycleService studentLifecycleService;
    private final SemanticLinkingService semanticLinkingService;

    @Data
    @Builder
    public static class OutboxMetricsDto {
        private long pendingCount;
        private long processingCount;
        private long completedCount;
        private long failedCount;
    }

    @GetMapping("/admin/automation/outbox-metrics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OutboxMetricsDto>> getOutboxMetrics() {
        OutboxMetricsDto metrics = OutboxMetricsDto.builder()
                .pendingCount(outboxEventRepository.countByStatus(OutboxStatus.PENDING))
                .processingCount(outboxEventRepository.countByStatus(OutboxStatus.PROCESSING))
                .completedCount(outboxEventRepository.countByStatus(OutboxStatus.COMPLETED))
                .failedCount(outboxEventRepository.countByStatus(OutboxStatus.FAILED))
                .build();

        return ResponseEntity.ok(ApiResponse.success(metrics));
    }

    @PostMapping("/admin/automation/ingest/courses/{courseId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> triggerCourseIngestion(@PathVariable Long courseId) {
        outboxService.publishEvent("COURSE", courseId, "COURSE_INGESTION_REQUESTED", "{\"courseId\":" + courseId + "}");
        return ResponseEntity.ok(ApiResponse.success(Map.of("message", "Запрос на векторизацию курса поставлен в очередь Outbox", "courseId", courseId)));
    }

    @GetMapping("/admin/automation/retention-risks")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<StudentRiskDto>>> getRetentionRisks() {
        List<StudentRiskDto> risks = studentLifecycleService.analyzeRetentionRisks();
        return ResponseEntity.ok(ApiResponse.success(risks));
    }

    @PostMapping("/courses/{courseId}/semantic-links")
    public ResponseEntity<ApiResponse<List<SemanticLinkDto>>> extractSemanticLinks(
            @PathVariable Long courseId,
            @RequestBody Map<String, String> request) {
        String text = request.getOrDefault("text", "");
        List<SemanticLinkDto> links = semanticLinkingService.findSemanticLinksInText(courseId, text);
        return ResponseEntity.ok(ApiResponse.success(links));
    }
}
