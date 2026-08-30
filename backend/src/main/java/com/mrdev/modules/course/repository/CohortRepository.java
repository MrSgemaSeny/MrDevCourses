package com.mrdev.modules.course.repository;

import com.mrdev.modules.course.model.Cohort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CohortRepository extends JpaRepository<Cohort, Long> {

    List<Cohort> findByCourseIdAndIsActiveTrueOrderByStartDateAsc(Long courseId);

    List<Cohort> findByCourseIdOrderByStartDateAsc(Long courseId);

    @org.springframework.data.jpa.repository.Query("SELECT c FROM Cohort c JOIN FETCH c.course ORDER BY c.startDate DESC")
    List<Cohort> findAllWithCourse();
}
