package com.mrdevcourses.modules.lesson.repository;

import com.mrdevcourses.modules.lesson.model.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByCourseIdOrderBySortOrderAscDayNumberAsc(Long courseId);
    Optional<Lesson> findByIdAndCourseId(Long id, Long courseId);
    long countByCourseId(Long courseId);
    boolean existsByCourseIdAndDayNumber(Long courseId, int dayNumber);
    boolean existsByCourseIdAndDayNumberAndIdNot(Long courseId, int dayNumber, Long id);
}
