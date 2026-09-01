package com.mrdev.modules.project.repository;

import com.mrdev.modules.project.model.ProjectLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;

@Repository
public interface ProjectLikeRepository extends JpaRepository<ProjectLike, Long> {

    boolean existsByProjectIdAndUserId(Long projectId, Long userId);

    Optional<ProjectLike> findByProjectIdAndUserId(Long projectId, Long userId);

    void deleteByProjectIdAndUserId(Long projectId, Long userId);

    @Query("SELECT pl.project.id FROM ProjectLike pl WHERE pl.user.id = :userId")
    Set<Long> findProjectIdsLikedByUser(@Param("userId") Long userId);
}