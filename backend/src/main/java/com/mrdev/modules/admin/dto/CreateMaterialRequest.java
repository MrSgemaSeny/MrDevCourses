package com.mrdev.modules.admin.dto;

import com.mrdev.modules.lesson.model.MaterialType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateMaterialRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    @NotNull(message = "Material type is required")
    private MaterialType materialType;

    @NotBlank(message = "URL is required")
    @Size(max = 500, message = "URL must not exceed 500 characters")
    private String url;

    private Long fileSizeBytes;

    @Builder.Default
    private Integer sortOrder = 1;
}
