package com.mrdev.modules.admin.service;

import com.mrdev.common.exception.ResourceNotFoundException;
import com.mrdev.common.util.SecurityUtils;
import com.mrdev.modules.admin.dto.CohortDto;
import com.mrdev.modules.admin.dto.CreateCohortRequest;
import com.mrdev.modules.admin.dto.UpdateCohortRequest;
import com.mrdev.modules.audit.service.AuditService;
import com.mrdev.modules.course.model.Cohort;
import com.mrdev.modules.course.model.Course;
import com.mrdev.modules.course.repository.CohortRepository;
import com.mrdev.modules.course.repository.CourseRepository;
import com.mrdev.modules.course.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminCohortService {

    private final CohortRepository cohortRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<CohortDto> getAllCohorts() {
        List<Cohort> cohorts = cohortRepository.findAllWithCourse();
        return cohorts.stream()
                .map(this::toCohortDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CohortDto> getCohortsByCourse(Long courseId) {
        courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));

        List<Cohort> cohorts = cohortRepository.findByCourseIdOrderByStartDateAsc(courseId);
        return cohorts.stream()
                .map(this::toCohortDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public CohortDto getCohortById(Long cohortId) {
        Cohort cohort = cohortRepository.findById(cohortId)
                .orElseThrow(() -> new ResourceNotFoundException("Cohort", "id", cohortId));
        return toCohortDto(cohort);
    }

    @Transactional
    public CohortDto createCohort(Long courseId, CreateCohortRequest request) {
        Long targetCourseId = courseId != null ? courseId : request.getCourseId();
        if (targetCourseId == null) {
            throw new IllegalArgumentException("Course ID must be provided");
        }

        Course course = courseRepository.findById(targetCourseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", targetCourseId));

        Cohort cohort = Cohort.builder()
                .course(course)
                .name(request.getName().trim())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .maxStudents(request.getMaxStudents() != null && request.getMaxStudents() > 0 ? request.getMaxStudents() : 50)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        Cohort saved = cohortRepository.save(cohort);
        Long adminId = SecurityUtils.getCurrentUserIdOptional().orElse(null);
        log.info("Admin ID {} created cohort ID {} '{}' for course ID {}", adminId, saved.getId(), saved.getName(), targetCourseId);
        auditService.logAction(
                adminId,
                "ADMIN_CREATE_COHORT",
                "Cohort",
                saved.getId(),
                "Created cohort '" + saved.getName() + "' for course: " + course.getTitle(),
                null
        );

        return toCohortDto(saved);
    }

    @Transactional
    public CohortDto updateCohort(Long cohortId, UpdateCohortRequest request) {
        Cohort cohort = cohortRepository.findById(cohortId)
                .orElseThrow(() -> new ResourceNotFoundException("Cohort", "id", cohortId));

        cohort.setName(request.getName().trim());
        cohort.setStartDate(request.getStartDate());
        cohort.setEndDate(request.getEndDate());
        if (request.getMaxStudents() != null && request.getMaxStudents() > 0) {
            cohort.setMaxStudents(request.getMaxStudents());
        }
        if (request.getIsActive() != null) {
            cohort.setIsActive(request.getIsActive());
        }

        Cohort updated = cohortRepository.save(cohort);
        Long adminId = SecurityUtils.getCurrentUserIdOptional().orElse(null);
        log.info("Admin ID {} updated cohort ID {}", adminId, cohortId);
        auditService.logAction(
                adminId,
                "ADMIN_UPDATE_COHORT",
                "Cohort",
                cohortId,
                "Updated cohort '" + updated.getName() + "' (Active: " + updated.getIsActive() + ")",
                null
        );

        return toCohortDto(updated);
    }

    @Transactional
    public void deleteCohort(Long cohortId) {
        Cohort cohort = cohortRepository.findById(cohortId)
                .orElseThrow(() -> new ResourceNotFoundException("Cohort", "id", cohortId));

        String cohortName = cohort.getName();
        cohortRepository.delete(cohort);
        Long adminId = SecurityUtils.getCurrentUserIdOptional().orElse(null);
        log.info("Admin ID {} deleted cohort ID {} '{}'", adminId, cohortId, cohortName);
        auditService.logAction(
                adminId,
                "ADMIN_DELETE_COHORT",
                "Cohort",
                cohortId,
                "Deleted cohort '" + cohortName + "'",
                null
        );
    }

    private CohortDto toCohortDto(Cohort cohort) {
        long enrolledCount = enrollmentRepository.countByCourseId(cohort.getCourse().getId());
        return CohortDto.builder()
                .id(cohort.getId())
                .courseId(cohort.getCourse().getId())
                .courseTitle(cohort.getCourse().getTitle())
                .courseSlug(cohort.getCourse().getSlug())
                .name(cohort.getName())
                .startDate(cohort.getStartDate())
                .endDate(cohort.getEndDate())
                .maxStudents(cohort.getMaxStudents())
                .currentStudentsCount(enrolledCount)
                .isActive(cohort.getIsActive())
                .createdAt(cohort.getCreatedAt())
                .build();
    }
}
