package com.mrdevcourses.modules.homework.repository;

import com.mrdevcourses.modules.homework.model.HomeworkSubmission;
import com.mrdevcourses.modules.homework.model.SubmissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HomeworkSubmissionRepository extends JpaRepository<HomeworkSubmission, Long> {

    List<HomeworkSubmission> findByUserIdAndLessonIdOrderByCreatedAtDesc(Long userId, Long lessonId);

    List<HomeworkSubmission> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<HomeworkSubmission> findByLessonIdOrderByCreatedAtDesc(Long lessonId);

    Optional<HomeworkSubmission> findFirstByUserIdAndLessonIdOrderByCreatedAtDesc(Long userId, Long lessonId);

    long countByCourseIdAndStatus(Long courseId, SubmissionStatus status);
}
