package com.mrdev.modules.admin.service;

import com.mrdev.common.dto.PageResponse;
import com.mrdev.modules.admin.dto.AuditLogDto;
import com.mrdev.modules.audit.model.AuditLog;
import com.mrdev.modules.audit.repository.AuditLogRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminAuditQueryService {

    private final AuditLogRepository auditLogRepository;

    @Transactional(readOnly = true)
    public PageResponse<AuditLogDto> getAuditLogs(
            Long userId,
            String action,
            String entityType,
            Instant from,
            Instant to,
            int page,
            int size
    ) {
        int pageNumber = Math.max(0, page);
        int pageSize = (size > 0 && size <= 200) ? size : 20;

        Specification<AuditLog> spec = buildSpecification(userId, action, entityType, from, to);
        PageRequest pageRequest = PageRequest.of(pageNumber, pageSize, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<AuditLog> auditPage = auditLogRepository.findAll(spec, pageRequest);
        Page<AuditLogDto> dtoPage = auditPage.map(this::mapToDto);

        return PageResponse.of(dtoPage);
    }

    private Specification<AuditLog> buildSpecification(
            Long userId,
            String action,
            String entityType,
            Instant from,
            Instant to
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (userId != null) {
                predicates.add(cb.equal(root.get("user").get("id"), userId));
            }

            if (action != null && !action.trim().isEmpty()) {
                predicates.add(cb.equal(cb.lower(root.get("action")), action.trim().toLowerCase()));
            }

            if (entityType != null && !entityType.trim().isEmpty()) {
                predicates.add(cb.equal(cb.lower(root.get("entityType")), entityType.trim().toLowerCase()));
            }

            if (from != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), from));
            }

            if (to != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), to));
            }

            return predicates.isEmpty()
                    ? cb.conjunction()
                    : cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private AuditLogDto mapToDto(AuditLog auditLog) {
        return AuditLogDto.builder()
                .id(auditLog.getId())
                .userId(auditLog.getUser() != null ? auditLog.getUser().getId() : null)
                .userEmail(auditLog.getUser() != null ? auditLog.getUser().getEmail() : null)
                .userName(auditLog.getUser() != null ? auditLog.getUser().getName() : null)
                .action(auditLog.getAction())
                .entityType(auditLog.getEntityType())
                .entityId(auditLog.getEntityId())
                .details(auditLog.getDetails())
                .ipAddress(auditLog.getIpAddress())
                .createdAt(auditLog.getCreatedAt())
                .build();
    }
}
