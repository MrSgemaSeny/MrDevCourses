package com.mrdevcourses.modules.course.repository;

import com.mrdevcourses.modules.course.model.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    Optional<Enrollment> findByUserIdAndCourseId(Long userId, Long courseId);
    boolean existsByUserIdAndCourseId(Long userId, Long courseId);
    List<Enrollment> findAllByUserIdOrderByEnrolledAtDesc(Long userId);
    long countByCourseId(Long courseId);

    @Query("SELECT e FROM Enrollment e JOIN FETCH e.course WHERE e.user.id = :userId ORDER BY e.enrolledAt DESC")
    List<Enrollment> findAllByUserIdWithCourse(@Param("userId") Long userId);

    @Query("SELECT e FROM Enrollment e JOIN FETCH e.user WHERE e.course.id = :courseId ORDER BY e.enrolledAt DESC")
    List<Enrollment> findAllByCourseIdWithUser(@Param("courseId") Long courseId);

    List<Enrollment> findAllByUserId(Long userId);
}
