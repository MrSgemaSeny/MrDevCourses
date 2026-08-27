package com.mrdevcourses.modules.course.repository;

import com.mrdevcourses.modules.course.model.CourseModule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseModuleRepository extends JpaRepository<CourseModule, Long> {

    List<CourseModule> findByCourseIdOrderBySortOrderAsc(Long courseId);

    @Query("SELECT DISTINCT m FROM CourseModule m LEFT JOIN FETCH m.lessons l WHERE m.course.id = :courseId ORDER BY m.sortOrder ASC, l.sortOrder ASC, l.dayNumber ASC")
    List<CourseModule> findAllByCourseIdWithLessons(@Param("courseId") Long courseId);
}
