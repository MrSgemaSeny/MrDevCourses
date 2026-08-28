package com.mrdev.modules.auth.dto;

import com.mrdev.modules.auth.model.Role;
import com.mrdev.modules.auth.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String email;
    private String name;
    private String avatarUrl;
    private Role role;
    private int currentStreak;
    private int longestStreak;
    private LocalDate lastActiveDate;
    private Instant createdAt;

    public static UserDto fromEntity(User user) {
        if (user == null) return null;
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .currentStreak(user.getCurrentStreak())
                .longestStreak(user.getLongestStreak())
                .lastActiveDate(user.getLastActiveDate())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
