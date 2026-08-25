package com.mrdevcourses.modules.lesson.repository;

import com.mrdevcourses.modules.lesson.model.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Query("SELECT l.course.id, COUNT(l) FROM Lesson l WHERE l.course.id IN :courseIds GROUP BY l.course.id")
    List<Object[]> countLessonsByCourseIds(@Param("courseIds") List<Long> courseIds);

    @Query("SELECT l FROM Lesson l WHERE l.course.id IN :courseIds ORDER BY l.sortOrder ASC, l.dayNumber ASC")
    List<Lesson> findAllByCourseIdInOrderBySortOrderAscDayNumberAsc(@Param("courseIds") List<Long> courseIds);
}
