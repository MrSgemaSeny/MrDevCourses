package com.mrdev.modules.quiz.repository;

import com.mrdev.modules.quiz.model.QuizSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizSubmissionRepository extends JpaRepository<QuizSubmission, Long> {

    List<QuizSubmission> findByUserIdAndQuizIdOrderByStartedAtDesc(Long userId, Long quizId);

    long countByUserIdAndQuizId(Long userId, Long quizId);

    List<QuizSubmission> findByUserIdOrderByStartedAtDesc(Long userId);
}
