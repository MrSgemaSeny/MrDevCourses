package com.mrdev.modules.lesson.repository;

import com.mrdev.modules.lesson.model.LessonProgress;
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

    long countByLessonId(Long lessonId);

    @Query("SELECT l.course.id, COUNT(lp) FROM LessonProgress lp JOIN lp.lesson l WHERE lp.user.id = :userId AND l.course.id IN :courseIds GROUP BY l.course.id")
    List<Object[]> countCompletedLessonsByUserAndCourseIds(@Param("userId") Long userId, @Param("courseIds") List<Long> courseIds);

    @Query("SELECT COUNT(DISTINCT lp.user.id) FROM LessonProgress lp WHERE lp.lesson.id = :lessonId")
    long countCompletedUsersByLessonId(@Param("lessonId") Long lessonId);

    @Query("SELECT lp.lesson.id, COUNT(DISTINCT lp.user.id) FROM LessonProgress lp WHERE lp.lesson.id IN :lessonIds GROUP BY lp.lesson.id")
    List<Object[]> countCompletedUsersByLessonIds(@Param("lessonIds") List<Long> lessonIds);

    @Query("SELECT lp FROM LessonProgress lp JOIN FETCH lp.lesson l JOIN FETCH lp.user u WHERE l.course.id = :courseId")
    List<LessonProgress> findAllByCourseIdWithUserAndLesson(@Param("courseId") Long courseId);
}
