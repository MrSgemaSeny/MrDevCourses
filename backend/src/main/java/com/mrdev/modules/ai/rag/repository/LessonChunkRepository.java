package com.mrdev.modules.ai.rag.repository;

import com.mrdev.modules.ai.rag.model.LessonChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonChunkRepository extends JpaRepository<LessonChunk, Long> {

    List<LessonChunk> findByLessonIdOrderByChunkIndexAsc(Long lessonId);

    List<LessonChunk> findByCourseId(Long courseId);

    @Modifying
    @Query("DELETE FROM LessonChunk lc WHERE lc.lessonId = :lessonId")
    void deleteByLessonId(@Param("lessonId") Long lessonId);

    @Query("SELECT lc FROM LessonChunk lc WHERE lc.courseId = :courseId AND " +
           "(LOWER(lc.content) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(COALESCE(lc.header, '')) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<LessonChunk> searchByKeyword(@Param("courseId") Long courseId, @Param("query") String query);

    @Query("SELECT lc FROM LessonChunk lc WHERE lc.lessonId = :lessonId AND " +
           "(LOWER(lc.content) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(COALESCE(lc.header, '')) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<LessonChunk> searchByKeywordInLesson(@Param("lessonId") Long lessonId, @Param("query") String query);
}
