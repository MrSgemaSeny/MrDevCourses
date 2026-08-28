package com.mrdev.modules.lesson.dto;

import com.mrdev.modules.lesson.model.MaterialType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonMaterialDto {
    private Long id;
    private String title;
    private MaterialType materialType;
    private String url;
    private Long fileSizeBytes;
    private Integer sortOrder;
}
