package com.mrdev.modules.homework.service;

import com.mrdev.common.exception.ApiException;
import com.mrdev.common.exception.ResourceNotFoundException;
import com.mrdev.modules.audit.service.AuditService;
import com.mrdev.modules.auth.model.Role;
import com.mrdev.modules.auth.model.User;
import com.mrdev.modules.auth.repository.UserRepository;
import com.mrdev.modules.course.model.Course;
import com.mrdev.modules.course.repository.CourseRepository;
import com.mrdev.modules.course.repository.EnrollmentRepository;
import com.mrdev.modules.homework.dto.AdminReviewHomeworkRequest;
import com.mrdev.modules.homework.dto.HomeworkSubmissionDto;
import com.mrdev.modules.homework.dto.HomeworkSubmitRequest;
import com.mrdev.modules.homework.model.HomeworkSubmission;
import com.mrdev.modules.homework.model.SubmissionStatus;
import com.mrdev.modules.homework.repository.HomeworkSubmissionRepository;
import com.mrdev.modules.lesson.model.Lesson;
import com.mrdev.modules.lesson.repository.LessonRepository;
import com.mrdev.modules.lesson.service.LessonService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class HomeworkService {

    private final HomeworkSubmissionRepository submissionRepository;
    private final LessonRepository lessonRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final LessonService lessonService;
    private final AuditService auditService;

    @Transactional
    public HomeworkSubmissionDto submitHomework(Long courseId, Long lessonId, Long userId, Role role, HomeworkSubmitRequest request) {
        Lesson lesson = lessonRepository.findByIdAndCourseId(lessonId, courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", lessonId));

        if (role != Role.ADMIN) {
            if (!enrollmentRepository.existsByUserIdAndCourseId(userId, courseId)) {
                throw new ApiException("Вы не записаны на этот курс", HttpStatus.FORBIDDEN);
            }
        }

        log.info("Student submission for userId={}, lessonId={}", userId, lessonId);

        HomeworkSubmission submission = HomeworkSubmission.builder()
                .lessonId(lessonId)
                .userId(userId)
                .courseId(courseId)
                .codeSnippet(request.getCodeSnippet() != null ? request.getCodeSnippet() : "")
                .repositoryUrl(request.getRepositoryUrl())
                .liveDemoUrl(request.getLiveDemoUrl())
                .status(SubmissionStatus.PENDING)
                .score(0)
                .build();

        submission = submissionRepository.save(submission);

        auditService.logAction(userId, "HOMEWORK_SUBMITTED", "Lesson", lessonId,
                "Submitted homework for review: repo=" + request.getRepositoryUrl() + ", liveDemo=" + request.getLiveDemoUrl(), null);

        return mapToDto(submission);
    }

    @Transactional
    public HomeworkSubmissionDto reviewSubmission(Long submissionId, Long adminId, AdminReviewHomeworkRequest request) {
        HomeworkSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("HomeworkSubmission", "id", submissionId));

        submission.setStatus(request.getStatus());
        submission.setMentorFeedback(request.getMentorFeedback());
        submission.setReviewedBy(adminId);
        submission.setReviewedAt(Instant.now());
        if (request.getStatus() == SubmissionStatus.PASSED) {
            submission.setScore(100);
        }

        submission = submissionRepository.save(submission);

        // If approved, complete the lesson for the student
        if (request.getStatus() == SubmissionStatus.PASSED) {
            try {
                lessonService.completeLesson(submission.getCourseId(), submission.getLessonId(), submission.getUserId(), Role.ADMIN);
                log.info("Mentor approved homework. Auto-completed lessonId={} for userId={}", submission.getLessonId(), submission.getUserId());
            } catch (Exception e) {
                log.warn("Could not auto-complete lesson after mentor approval: {}", e.getMessage());
            }
        }

        auditService.logAction(adminId, "HOMEWORK_REVIEWED", "HomeworkSubmission", submissionId,
                "Mentor review: status=" + request.getStatus() + ", feedback=" + request.getMentorFeedback(), null);

        return mapToDto(submission);
    }

    @Transactional(readOnly = true)
    public List<HomeworkSubmissionDto> getAllSubmissions(SubmissionStatus status) {
        List<HomeworkSubmission> list = (status != null)
                ? submissionRepository.findByStatusOrderByCreatedAtDesc(status)
                : submissionRepository.findAllByOrderByCreatedAtDesc();

        return enrichAndMapList(list);
    }

    @Transactional(readOnly = true)
    public List<HomeworkSubmissionDto> getUserSubmissions(Long userId, Long lessonId) {
        return submissionRepository.findByUserIdAndLessonIdOrderByCreatedAtDesc(userId, lessonId)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public HomeworkSubmissionDto getSubmissionById(Long submissionId, Long userId, Role role) {
        HomeworkSubmission sub = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("HomeworkSubmission", "id", submissionId));

        if (role != Role.ADMIN && !sub.getUserId().equals(userId)) {
            throw new ApiException("Доступ запрещен к чужой работе", HttpStatus.FORBIDDEN);
        }

        return mapToDto(sub);
    }

    private List<HomeworkSubmissionDto> enrichAndMapList(List<HomeworkSubmission> list) {
        if (list.isEmpty()) return List.of();

        List<Long> userIds = list.stream().map(HomeworkSubmission::getUserId).distinct().toList();
        List<Long> lessonIds = list.stream().map(HomeworkSubmission::getLessonId).distinct().toList();
        List<Long> courseIds = list.stream().map(HomeworkSubmission::getCourseId).distinct().toList();

        Map<Long, User> userMap = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));
        Map<Long, Lesson> lessonMap = lessonRepository.findAllById(lessonIds).stream()
                .collect(Collectors.toMap(Lesson::getId, l -> l));
        Map<Long, Course> courseMap = courseRepository.findAllById(courseIds).stream()
                .collect(Collectors.toMap(Course::getId, c -> c));

        return list.stream().map(sub -> {
            HomeworkSubmissionDto dto = mapToDto(sub);
            User u = userMap.get(sub.getUserId());
            if (u != null) {
                dto.setStudentName(u.getName());
                dto.setStudentEmail(u.getEmail());
            }
            Lesson l = lessonMap.get(sub.getLessonId());
            if (l != null) {
                dto.setLessonTitle(l.getTitle());
            }
            Course c = courseMap.get(sub.getCourseId());
            if (c != null) {
                dto.setCourseTitle(c.getTitle());
            }
            return dto;
        }).toList();
    }

    private HomeworkSubmissionDto mapToDto(HomeworkSubmission sub) {
        return HomeworkSubmissionDto.builder()
                .id(sub.getId())
                .lessonId(sub.getLessonId())
                .userId(sub.getUserId())
                .courseId(sub.getCourseId())
                .codeSnippet(sub.getCodeSnippet())
                .repositoryUrl(sub.getRepositoryUrl())
                .liveDemoUrl(sub.getLiveDemoUrl())
                .status(sub.getStatus())
                .score(sub.getScore())
                .aiFeedback(sub.getAiFeedback())
                .mentorFeedback(sub.getMentorFeedback())
                .reviewedBy(sub.getReviewedBy())
                .passedTestsCount(sub.getPassedTestsCount())
                .totalTestsCount(sub.getTotalTestsCount())
                .securityFlags(sub.getSecurityFlags())
                .reviewedAt(sub.getReviewedAt())
                .createdAt(sub.getCreatedAt())
                .build();
    }
}
