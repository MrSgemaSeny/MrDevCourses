package com.mrdev.modules.project.repository;

import com.mrdev.modules.project.model.ProjectShowcase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectShowcaseRepository extends JpaRepository<ProjectShowcase, Long> {

    List<ProjectShowcase> findAllByOrderByFeaturedDescCreatedAtDesc();

    List<ProjectShowcase> findByUserIdOrderByCreatedAtDesc(Long userId);

    long countByUserId(Long userId);

    @Modifying
    @Query("UPDATE ProjectShowcase p SET p.likesCount = p.likesCount + 1 WHERE p.id = :id")
    void incrementLikes(@Param("id") Long id);

    @Modifying
    @Query("UPDATE ProjectShowcase p SET p.likesCount = CASE WHEN p.likesCount > 0 THEN p.likesCount - 1 ELSE 0 END WHERE p.id = :id")
    void decrementLikes(@Param("id") Long id);
}
