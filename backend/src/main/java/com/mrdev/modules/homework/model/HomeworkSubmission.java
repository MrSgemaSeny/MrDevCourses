package com.mrdev.modules.homework.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "homework_submissions", indexes = {
        @Index(name = "idx_homework_user_lesson", columnList = "user_id, lesson_id"),
        @Index(name = "idx_homework_status", columnList = "status"),
        @Index(name = "idx_homework_course", columnList = "course_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HomeworkSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "lesson_id", nullable = false)
    private Long lessonId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    @Column(name = "code_snippet", nullable = false, columnDefinition = "TEXT")
    private String codeSnippet;

    @Column(name = "repository_url", length = 500)
    private String repositoryUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private SubmissionStatus status = SubmissionStatus.PENDING;

    @Column(name = "score")
    @Builder.Default
    private Integer score = 0;

    @Column(name = "ai_feedback", columnDefinition = "TEXT")
    private String aiFeedback;

    @Column(name = "passed_tests_count")
    @Builder.Default
    private Integer passedTestsCount = 0;

    @Column(name = "total_tests_count")
    @Builder.Default
    private Integer totalTestsCount = 0;

    @Column(name = "security_flags", columnDefinition = "TEXT")
    private String securityFlags;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
