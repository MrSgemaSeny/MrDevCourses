package com.mrdev.modules.lesson.repository;

import com.mrdev.modules.lesson.model.LessonMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonMaterialRepository extends JpaRepository<LessonMaterial, Long> {

    List<LessonMaterial> findByLessonIdOrderBySortOrderAsc(Long lessonId);
}
