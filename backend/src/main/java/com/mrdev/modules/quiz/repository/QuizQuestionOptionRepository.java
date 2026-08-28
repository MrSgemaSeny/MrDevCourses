package com.mrdev.modules.quiz.repository;

import com.mrdev.modules.quiz.model.QuizQuestionOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizQuestionOptionRepository extends JpaRepository<QuizQuestionOption, Long> {

    List<QuizQuestionOption> findByQuestionIdOrderBySortOrderAsc(Long questionId);
}
