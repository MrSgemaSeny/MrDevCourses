package com.mrdevcourses.modules.course.repository;

import com.mrdevcourses.modules.course.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByActiveTrueOrderByCreatedAtDesc();
    Optional<Course> findBySlug(String slug);
    Optional<Course> findBySlugAndActiveTrue(String slug);
    boolean existsBySlug(String slug);
}
