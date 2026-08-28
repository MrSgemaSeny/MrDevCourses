package com.mrdev.modules.ai.rag.repository;

import com.mrdev.modules.ai.rag.model.GlossaryEmbedding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GlossaryEmbeddingRepository extends JpaRepository<GlossaryEmbedding, Long> {

    List<GlossaryEmbedding> findByCourseId(Long courseId);

    Optional<GlossaryEmbedding> findByCourseIdAndTerm(Long courseId, String term);

    @Query("SELECT ge FROM GlossaryEmbedding ge WHERE ge.courseId = :courseId AND " +
           "(LOWER(ge.term) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(ge.definition) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<GlossaryEmbedding> searchByKeyword(@Param("courseId") Long courseId, @Param("query") String query);
}
