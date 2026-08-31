package com.mrdev.modules.admin.service;

import com.mrdev.common.exception.ResourceNotFoundException;
import com.mrdev.modules.admin.dto.CohortDto;
import com.mrdev.modules.admin.dto.CreateCohortRequest;
import com.mrdev.modules.admin.dto.UpdateCohortRequest;
import com.mrdev.modules.audit.service.AuditService;
import com.mrdev.modules.course.model.Cohort;
import com.mrdev.modules.course.model.Course;
import com.mrdev.modules.course.repository.CohortRepository;
import com.mrdev.modules.course.repository.CourseRepository;
import com.mrdev.modules.course.repository.EnrollmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminCohortServiceTest {

    @Mock
    private CohortRepository cohortRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private AdminCohortService adminCohortService;

    private Course course;
    private Cohort cohort;

    @BeforeEach
    void setUp() {
        course = Course.builder()
                .id(10L)
                .title("Full Stack Mastery")
                .slug("full-stack-mastery")
                .active(true)
                .createdAt(Instant.now())
                .build();

        cohort = Cohort.builder()
                .id(100L)
                .course(course)
                .name("Cohort Alpha 2026")
                .startDate(Instant.now().plus(1, ChronoUnit.DAYS))
                .endDate(Instant.now().plus(30, ChronoUnit.DAYS))
                .maxStudents(60)
                .isActive(true)
                .createdAt(Instant.now())
                .build();

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(1L, null, List.of())
        );
    }

    @Test
    @DisplayName("getAllCohorts should return list of cohorts with enrolled count")
    void getAllCohorts_ShouldReturnList() {
        when(cohortRepository.findAllWithCourse()).thenReturn(List.of(cohort));
        when(enrollmentRepository.countByCourseId(10L)).thenReturn(25L);

        List<CohortDto> result = adminCohortService.getAllCohorts();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Cohort Alpha 2026");
        assertThat(result.get(0).getCurrentStudentsCount()).isEqualTo(25L);
    }

    @Test
    @DisplayName("createCohort should validate course and save cohort with audit log")
    void createCohort_ShouldSaveAndLog() {
        CreateCohortRequest request = CreateCohortRequest.builder()
                .courseId(10L)
                .name("New Batch")
                .startDate(Instant.now())
                .maxStudents(40)
                .isActive(true)
                .build();

        when(courseRepository.findById(10L)).thenReturn(Optional.of(course));
        when(cohortRepository.save(any(Cohort.class))).thenReturn(cohort);
        when(enrollmentRepository.countByCourseId(10L)).thenReturn(0L);

        CohortDto result = adminCohortService.createCohort(10L, request);

        assertThat(result).isNotNull();
        verify(auditService).logAction(eq(1L), eq("ADMIN_CREATE_COHORT"), eq("Cohort"), eq(100L), anyString(), isNull());
    }

    @Test
    @DisplayName("updateCohort should modify cohort and log audit")
    void updateCohort_ShouldUpdateAndLog() {
        UpdateCohortRequest request = UpdateCohortRequest.builder()
                .name("Updated Cohort Alpha")
                .startDate(Instant.now())
                .maxStudents(80)
                .isActive(false)
                .build();

        when(cohortRepository.findById(100L)).thenReturn(Optional.of(cohort));
        when(cohortRepository.save(any(Cohort.class))).thenReturn(cohort);
        when(enrollmentRepository.countByCourseId(10L)).thenReturn(10L);

        CohortDto result = adminCohortService.updateCohort(100L, request);

        assertThat(result).isNotNull();
        verify(auditService).logAction(eq(1L), eq("ADMIN_UPDATE_COHORT"), eq("Cohort"), eq(100L), anyString(), isNull());
    }

    @Test
    @DisplayName("deleteCohort should delete cohort and log audit")
    void deleteCohort_ShouldDeleteAndLog() {
        when(cohortRepository.findById(100L)).thenReturn(Optional.of(cohort));

        adminCohortService.deleteCohort(100L);

        verify(cohortRepository).delete(cohort);
        verify(auditService).logAction(eq(1L), eq("ADMIN_DELETE_COHORT"), eq("Cohort"), eq(100L), anyString(), isNull());
    }

    @Test
    @DisplayName("deleteCohort when not found should throw ResourceNotFoundException")
    void deleteCohort_NotFound_ShouldThrow() {
        when(cohortRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminCohortService.deleteCohort(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
