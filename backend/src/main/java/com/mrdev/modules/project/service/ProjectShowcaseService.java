package com.mrdev.modules.project.service;

import com.mrdev.common.exception.ResourceNotFoundException;
import com.mrdev.modules.audit.service.AuditService;
import com.mrdev.modules.auth.model.User;
import com.mrdev.modules.auth.repository.UserRepository;
import com.mrdev.modules.course.model.Course;
import com.mrdev.modules.course.repository.CourseRepository;
import com.mrdev.modules.project.dto.CreateProjectShowcaseRequest;
import com.mrdev.modules.project.dto.ProjectShowcaseDto;
import com.mrdev.modules.project.model.ProjectShowcase;
import com.mrdev.modules.project.repository.ProjectShowcaseRepository;
import com.mrdev.modules.project.model.ProjectLike;
import com.mrdev.modules.project.repository.ProjectLikeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectShowcaseService {

    private final ProjectShowcaseRepository showcaseRepository;
    private final ProjectLikeRepository projectLikeRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final AuditService auditService;
    private final com.mrdev.modules.help.service.TelegramNotificationService telegramNotificationService;

    @Transactional(readOnly = true)
    public List<ProjectShowcaseDto> getAllShowcases(Long currentUserId) {
        Set<Long> likedIds = (currentUserId != null)
                ? projectLikeRepository.findProjectIdsLikedByUser(currentUserId)
                : Collections.emptySet();

        return showcaseRepository.findAllByOrderByFeaturedDescCreatedAtDesc()
                .stream()
                .map(p -> mapToDto(p, likedIds.contains(p.getId())))
                .toList();
    }

    @Transactional
    public ProjectShowcaseDto createShowcase(Long userId, CreateProjectShowcaseRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Course course = null;
        if (request.getCourseId() != null) {
            course = courseRepository.findById(request.getCourseId()).orElse(null);
        }

        ProjectShowcase showcase = ProjectShowcase.builder()
                .user(user)
                .course(course)
                .title(request.getTitle())
                .description(request.getDescription())
                .thumbnailUrl(request.getThumbnailUrl())
                .liveDemoUrl(request.getLiveDemoUrl())
                .githubRepoUrl(request.getGithubRepoUrl())
                .authorName(user.getName() != null ? user.getName() : "Студент")
                .authorAvatarUrl(user.getAvatarUrl())
                .techStack(request.getTechStack() != null ? request.getTechStack() : "React 19, Vite, Tailwind CSS")
                .featured(false)
                .likesCount(0)
                .build();

        showcase = showcaseRepository.save(showcase);

        // Telegram Notification for mentor
        String details = String.format(
                "[Новый проект выпускника]\nАвтор: %s (`%s`)\nПроект: %s\nGitHub: %s\nLive Demo: %s",
                showcase.getAuthorName(),
                user.getEmail(),
                showcase.getTitle(),
                showcase.getGithubRepoUrl(),
                showcase.getLiveDemoUrl()
        );
        telegramNotificationService.sendMentorAlert("Стена Проектов: Новый Релиз", details);

        auditService.logAction(userId, "PROJECT_SHOWCASE_CREATED", "ProjectShowcase", showcase.getId(),
                "Published project: " + showcase.getTitle(), null);

        return mapToDto(showcase, false);
    }

    @Transactional
    public boolean toggleLike(Long userId, Long projectId) {
        ProjectShowcase project = showcaseRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("ProjectShowcase", "id", projectId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Optional<ProjectLike> existingLike = projectLikeRepository.findByProjectIdAndUserId(projectId, userId);
        if (existingLike.isPresent()) {
            projectLikeRepository.delete(existingLike.get());
            showcaseRepository.decrementLikes(projectId);
            log.info("User {} unliked project {}", userId, projectId);
            return false;
        } else {
            ProjectLike like = ProjectLike.builder()
                    .project(project)
                    .user(user)
                    .build();
            projectLikeRepository.save(like);
            showcaseRepository.incrementLikes(projectId);
            log.info("User {} liked project {}", userId, projectId);
            return true;
        }
    }

    @Transactional
    public void likeProject(Long projectId) {
        if (!showcaseRepository.existsById(projectId)) {
            throw new ResourceNotFoundException("ProjectShowcase", "id", projectId);
        }
        showcaseRepository.incrementLikes(projectId);
    }

    private ProjectShowcaseDto mapToDto(ProjectShowcase p, boolean hasLiked) {
        return ProjectShowcaseDto.builder()
                .id(p.getId())
                .userId(p.getUser().getId())
                .courseId(p.getCourse() != null ? p.getCourse().getId() : null)
                .courseTitle(p.getCourse() != null ? p.getCourse().getTitle() : null)
                .title(p.getTitle())
                .description(p.getDescription())
                .thumbnailUrl(p.getThumbnailUrl())
                .liveDemoUrl(p.getLiveDemoUrl())
                .githubRepoUrl(p.getGithubRepoUrl())
                .authorName(p.getAuthorName())
                .authorAvatarUrl(p.getAuthorAvatarUrl())
                .techStack(p.getTechStack())
                .featured(p.isFeatured())
                .likesCount(p.getLikesCount())
                .hasLiked(hasLiked)
                .createdAt(p.getCreatedAt())
                .build();
    }
}
