package com.mrdev.modules.ai.rag.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "glossary_embeddings", uniqueConstraints = {
        @UniqueConstraint(name = "uk_glossary_embeddings_course_term", columnNames = {"course_id", "term"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GlossaryEmbedding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    @Column(name = "term", nullable = false, length = 150)
    private String term;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "definition", nullable = false, columnDefinition = "TEXT")
    private String definition;

    @Column(name = "embedding", columnDefinition = "TEXT")
    private String embedding;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
