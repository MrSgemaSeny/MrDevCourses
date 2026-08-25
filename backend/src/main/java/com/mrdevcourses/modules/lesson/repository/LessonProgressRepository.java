package com.mrdevcourses.modules.lesson.repository;

import com.mrdevcourses.modules.lesson.model.LessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {
    Optional<LessonProgress> findByUserIdAndLessonId(Long userId, Long lessonId);
    boolean existsByUserIdAndLessonId(Long userId, Long lessonId);
    List<LessonProgress> findAllByUserId(Long userId);

    @Query("SELECT lp FROM LessonProgress lp JOIN FETCH lp.lesson l WHERE lp.user.id = :userId AND l.course.id = :courseId")
    List<LessonProgress> findAllByUserIdAndCourseId(@Param("userId") Long userId, @Param("courseId") Long courseId);

    @Query("SELECT COUNT(lp) FROM LessonProgress lp JOIN lp.lesson l WHERE lp.user.id = :userId AND l.course.id = :courseId")
    long countCompletedLessonsByUserIdAndCourseId(@Param("userId") Long userId, @Param("courseId") Long courseId);
}
