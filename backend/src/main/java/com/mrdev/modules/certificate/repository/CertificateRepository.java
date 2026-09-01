package com.mrdev.modules.certificate.repository;

import com.mrdev.modules.certificate.model.Certificate;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, Long> {

    @EntityGraph(attributePaths = {"user", "course"})
    Optional<Certificate> findByCertificateCode(String certificateCode);

    @EntityGraph(attributePaths = {"user", "course"})
    Optional<Certificate> findByUserIdAndCourseId(Long userId, Long courseId);

    boolean existsByUserIdAndCourseId(Long userId, Long courseId);

    long countByUserId(Long userId);
}
