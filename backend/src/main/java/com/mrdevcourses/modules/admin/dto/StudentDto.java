package com.mrdevcourses.modules.admin.dto;

import com.mrdevcourses.modules.auth.model.Role;
import com.mrdevcourses.modules.course.dto.EnrollmentDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentDto {
    private Long id;
    private String email;
    private String name;
    private String avatarUrl;
    private Role role;
    private Instant createdAt;
    private List<EnrollmentDto> enrollments;
}
