package com.mrdevcourses.modules.course.repository;

import com.mrdevcourses.modules.course.model.Cohort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CohortRepository extends JpaRepository<Cohort, Long> {

    List<Cohort> findByCourseIdAndIsActiveTrueOrderByStartDateAsc(Long courseId);
}
