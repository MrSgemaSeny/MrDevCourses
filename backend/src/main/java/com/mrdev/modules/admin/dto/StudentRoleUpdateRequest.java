package com.mrdev.modules.admin.dto;

import com.mrdev.modules.auth.model.Role;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentRoleUpdateRequest {

    @NotNull(message = "Role is required")
    private Role role;
}
