package com.mrdev.modules.lesson.repository;

import com.mrdev.modules.lesson.model.LessonPitfall;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonPitfallRepository extends JpaRepository<LessonPitfall, Long> {
    List<LessonPitfall> findAllByLessonIdOrderByOrderIndexAsc(Long lessonId);
    void deleteAllByLessonId(Long lessonId);
}