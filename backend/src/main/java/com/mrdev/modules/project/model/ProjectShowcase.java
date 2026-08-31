package com.mrdev.modules.project.model;

import com.mrdev.modules.auth.model.User;
import com.mrdev.modules.course.model.Course;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "project_showcases")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectShowcase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "thumbnail_url", length = 1024)
    private String thumbnailUrl;

    @Column(name = "live_demo_url", nullable = false, length = 1024)
    private String liveDemoUrl;

    @Column(name = "github_repo_url", nullable = false, length = 1024)
    private String githubRepoUrl;

    @Column(name = "author_name", nullable = false)
    private String authorName;

    @Column(name = "author_avatar_url", length = 1024)
    private String authorAvatarUrl;

    @Column(name = "tech_stack")
    @Builder.Default
    private String techStack = "React 19, Vite, Tailwind CSS";

    @Column(nullable = false)
    @Builder.Default
    private boolean featured = false;

    @Column(name = "likes_count", nullable = false)
    @Builder.Default
    private int likesCount = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
