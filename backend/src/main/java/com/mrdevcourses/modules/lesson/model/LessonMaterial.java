package com.mrdevcourses.modules.lesson.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "lesson_materials", indexes = {
        @Index(name = "idx_lesson_materials_lesson", columnList = "lesson_id, sort_order")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Column(name = "title", nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "material_type", nullable = false, length = 50)
    @Builder.Default
    private MaterialType materialType = MaterialType.CHEAT_SHEET;

    @Column(name = "url", nullable = false, length = 500)
    private String url;

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 1;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
