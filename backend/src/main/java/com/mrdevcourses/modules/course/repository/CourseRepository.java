package com.mrdevcourses.modules.course.repository;

import com.mrdevcourses.modules.course.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByActiveTrueOrderByCreatedAtDesc();
    default List<Course> findByIsActiveTrueOrderByCreatedAtDesc() {
        return findByActiveTrueOrderByCreatedAtDesc();
    }
    Optional<Course> findBySlug(String slug);
    Optional<Course> findBySlugAndActiveTrue(String slug);
    default Optional<Course> findBySlugAndIsActiveTrue(String slug) {
        return findBySlugAndActiveTrue(slug);
    }
    boolean existsBySlug(String slug);
}
