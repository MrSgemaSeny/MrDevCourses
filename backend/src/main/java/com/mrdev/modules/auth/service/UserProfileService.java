package com.mrdev.modules.auth.service;

import com.mrdev.common.exception.ResourceNotFoundException;
import com.mrdev.modules.audit.service.AuditService;
import com.mrdev.modules.auth.dto.UpdateUserProfileRequest;
import com.mrdev.modules.auth.dto.UserProfileDto;
import com.mrdev.modules.auth.model.User;
import com.mrdev.modules.auth.repository.UserRepository;
import com.mrdev.modules.certificate.repository.CertificateRepository;
import com.mrdev.modules.course.repository.EnrollmentRepository;
import com.mrdev.modules.homework.model.SubmissionStatus;
import com.mrdev.modules.homework.repository.HomeworkSubmissionRepository;
import com.mrdev.modules.lesson.repository.LessonProgressRepository;
import com.mrdev.modules.project.repository.ProjectShowcaseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final CertificateRepository certificateRepository;
    private final ProjectShowcaseRepository projectShowcaseRepository;
    private final HomeworkSubmissionRepository homeworkSubmissionRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public UserProfileDto getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        int enrolledCoursesCount = enrollmentRepository.findAllByUserId(userId).size();
        int completedLessonsCount = lessonProgressRepository.findAllByUserId(userId).size();
        int certificatesCount = (int) certificateRepository.countByUserId(userId);
        int timeSpentMinutes = lessonProgressRepository.sumCompletedMinutesByUserId(userId);
        int completedProjectsCount = (int) projectShowcaseRepository.countByUserId(userId)
                + (int) homeworkSubmissionRepository.countByUserIdAndStatus(userId, SubmissionStatus.PASSED);

        return mapToDto(user, enrolledCoursesCount, completedLessonsCount, certificatesCount, timeSpentMinutes, completedProjectsCount);
    }

    @Transactional
    public UserProfileDto updateProfile(Long userId, UpdateUserProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
        }

        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl().trim().isEmpty() ? null : request.getAvatarUrl().trim());
        }

        if (request.getTelegramUsername() != null) {
            String tg = request.getTelegramUsername().trim();
            if (tg.startsWith("@")) {
                tg = tg.substring(1);
            }
            if (!tg.isEmpty()) {
                Optional<User> existingTg = userRepository.findByTelegramUsernameIgnoreCase(tg);
                if (existingTg.isPresent() && !existingTg.get().getId().equals(userId)) {
                    throw new com.mrdev.common.exception.ApiException(
                            "Telegram никнейм @" + tg + " уже привязан к другому аккаунту",
                            org.springframework.http.HttpStatus.CONFLICT
                    );
                }
                user.setTelegramUsername(tg);
            } else {
                user.setTelegramUsername(null);
            }
        }

        if (request.getGithubUsername() != null) {
            String gh = request.getGithubUsername().trim();
            if (gh.startsWith("@")) {
                gh = gh.substring(1);
            }
            user.setGithubUsername(gh.isEmpty() ? null : gh);
        }

        if (request.getBio() != null) {
            user.setBio(request.getBio().trim().isEmpty() ? null : request.getBio().trim());
        }

        if (request.getGoal() != null) {
            user.setGoal(request.getGoal().trim().isEmpty() ? null : request.getGoal().trim());
        }

        user = userRepository.save(user);

        auditService.logAction(userId, "USER_PROFILE_UPDATED", "User", userId,
                "Updated profile details: " + user.getEmail(), null);

        int enrolledCoursesCount = enrollmentRepository.findAllByUserId(userId).size();
        int completedLessonsCount = lessonProgressRepository.findAllByUserId(userId).size();
        int certificatesCount = (int) certificateRepository.countByUserId(userId);
        int timeSpentMinutes = lessonProgressRepository.sumCompletedMinutesByUserId(userId);
        int completedProjectsCount = (int) projectShowcaseRepository.countByUserId(userId)
                + (int) homeworkSubmissionRepository.countByUserIdAndStatus(userId, SubmissionStatus.PASSED);

        return mapToDto(user, enrolledCoursesCount, completedLessonsCount, certificatesCount, timeSpentMinutes, completedProjectsCount);
    }

    private UserProfileDto mapToDto(User user, int enrolledCourses, int completedLessons, int certificates, int timeSpentMinutes, int completedProjectsCount) {
        return UserProfileDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .currentStreak(user.getCurrentStreak())
                .longestStreak(user.getLongestStreak())
                .lastActiveDate(user.getLastActiveDate())
                .telegramUsername(user.getTelegramUsername())
                .telegramChatId(user.getTelegramChatId())
                .emailNotificationsEnabled(user.isEmailNotificationsEnabled())
                .telegramNotificationsEnabled(user.isTelegramNotificationsEnabled())
                .githubUsername(user.getGithubUsername())
                .bio(user.getBio())
                .goal(user.getGoal())
                .createdAt(user.getCreatedAt())
                .enrolledCoursesCount(enrolledCourses)
                .completedLessonsCount(completedLessons)
                .certificatesCount(certificates)
                .timeSpentMinutes(timeSpentMinutes)
                .completedProjectsCount(completedProjectsCount)
                .build();
    }
}