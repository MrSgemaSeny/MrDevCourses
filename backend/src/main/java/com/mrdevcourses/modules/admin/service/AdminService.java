package com.mrdevcourses.modules.admin.service;

import com.mrdevcourses.common.exception.ApiException;
import com.mrdevcourses.common.exception.ResourceNotFoundException;
import com.mrdevcourses.modules.admin.dto.StudentDto;
import com.mrdevcourses.modules.auth.model.Role;
import com.mrdevcourses.modules.auth.model.User;
import com.mrdevcourses.modules.auth.repository.UserRepository;
import com.mrdevcourses.modules.course.dto.CourseDto;
import com.mrdevcourses.modules.course.dto.CreateCourseRequest;
import com.mrdevcourses.modules.course.dto.EnrollmentDto;
import com.mrdevcourses.modules.course.dto.UpdateCourseRequest;
import com.mrdevcourses.modules.course.model.Course;
import com.mrdevcourses.modules.course.model.Enrollment;
import com.mrdevcourses.modules.course.repository.CourseRepository;
import com.mrdevcourses.modules.course.repository.EnrollmentRepository;
import com.mrdevcourses.modules.lesson.dto.CreateLessonRequest;
import com.mrdevcourses.modules.lesson.dto.LessonDetailDto;
import com.mrdevcourses.modules.lesson.dto.UpdateLessonRequest;
import com.mrdevcourses.modules.lesson.model.Lesson;
import com.mrdevcourses.modules.lesson.repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<CourseDto> getAllCoursesAdmin() {
        return courseRepository.findAll().stream()
                .map(this::toCourseDto)
                .toList();
    }

    @Transactional
    public CourseDto createCourse(CreateCourseRequest request) {
        if (courseRepository.existsBySlug(request.getSlug())) {
            throw new ApiException("Course with slug '" + request.getSlug() + "' already exists", HttpStatus.CONFLICT);
        }

        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .slug(request.getSlug().toLowerCase().trim())
                .active(request.isActive())
                .build();

        Course saved = courseRepository.save(course);
        log.info("Admin created course: {} (ID: {})", saved.getTitle(), saved.getId());
        return toCourseDto(saved);
    }

    @Transactional
    public CourseDto updateCourse(Long courseId, UpdateCourseRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));

        if (!course.getSlug().equalsIgnoreCase(request.getSlug()) && courseRepository.existsBySlug(request.getSlug())) {
            throw new ApiException("Course with slug '" + request.getSlug() + "' already exists", HttpStatus.CONFLICT);
        }

        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setSlug(request.getSlug().toLowerCase().trim());
        course.setActive(request.isActive());

        Course updated = courseRepository.save(course);
        log.info("Admin updated course ID: {}", courseId);
        return toCourseDto(updated);
    }

    @Transactional
    public void deleteCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));
        courseRepository.delete(course);
        log.info("Admin deleted course ID: {}", courseId);
    }

    @Transactional(readOnly = true)
    public List<LessonDetailDto> getLessonsForCourseAdmin(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));

        return lessonRepository.findByCourseIdOrderBySortOrderAscDayNumberAsc(courseId).stream()
                .map(lesson -> toLessonDetailDto(lesson, course))
                .toList();
    }

    @Transactional
    public LessonDetailDto createLesson(Long courseId, CreateLessonRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));

        if (lessonRepository.existsByCourseIdAndDayNumber(courseId, request.getDayNumber())) {
            throw new ApiException("Lesson for day " + request.getDayNumber() + " already exists in this course", HttpStatus.CONFLICT);
        }

        Lesson lesson = Lesson.builder()
                .course(course)
                .title(request.getTitle())
                .content(request.getContent())
                .youtubeUrl(request.getYoutubeUrl())
                .dayNumber(request.getDayNumber())
                .sortOrder(request.getSortOrder() > 0 ? request.getSortOrder() : request.getDayNumber())
                .build();

        Lesson saved = lessonRepository.save(lesson);
        log.info("Admin created lesson ID: {} for course ID: {}", saved.getId(), courseId);
        return toLessonDetailDto(saved, course);
    }

    @Transactional
    public LessonDetailDto updateLesson(Long lessonId, UpdateLessonRequest request) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", lessonId));

        Long courseId = lesson.getCourse().getId();
        if (lessonRepository.existsByCourseIdAndDayNumberAndIdNot(courseId, request.getDayNumber(), lessonId)) {
            throw new ApiException("Lesson for day " + request.getDayNumber() + " already exists in this course", HttpStatus.CONFLICT);
        }

        lesson.setTitle(request.getTitle());
        lesson.setContent(request.getContent());
        lesson.setYoutubeUrl(request.getYoutubeUrl());
        lesson.setDayNumber(request.getDayNumber());
        lesson.setSortOrder(request.getSortOrder());

        Lesson updated = lessonRepository.save(lesson);
        log.info("Admin updated lesson ID: {}", lessonId);
        return toLessonDetailDto(updated, lesson.getCourse());
    }

    @Transactional
    public void deleteLesson(Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", lessonId));
        lessonRepository.delete(lesson);
        log.info("Admin deleted lesson ID: {}", lessonId);
    }

    @Transactional(readOnly = true)
    public List<StudentDto> getAllStudents() {
        List<User> students = userRepository.findAll();
        return students.stream()
                .map(user -> {
                    List<EnrollmentDto> userEnrollments = enrollmentRepository.findAllByUserId(user.getId()).stream()
                            .map(e -> EnrollmentDto.builder()
                                    .id(e.getId())
                                    .userId(user.getId())
                                    .userEmail(user.getEmail())
                                    .userName(user.getName())
                                    .courseId(e.getCourse().getId())
                                    .courseTitle(e.getCourse().getTitle())
                                    .courseSlug(e.getCourse().getSlug())
                                    .enrolledAt(e.getEnrolledAt())
                                    .build())
                            .toList();

                    return StudentDto.builder()
                            .id(user.getId())
                            .email(user.getEmail())
                            .name(user.getName())
                            .avatarUrl(user.getAvatarUrl())
                            .role(user.getRole())
                            .createdAt(user.getCreatedAt())
                            .enrollments(userEnrollments)
                            .build();
                })
                .toList();
    }

    @Transactional
    public EnrollmentDto enrollStudentManually(Long userId, Long courseId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));

        Optional<Enrollment> existing = enrollmentRepository.findByUserIdAndCourseId(userId, courseId);
        if (existing.isPresent()) {
            return toEnrollmentDto(existing.get());
        }

        Enrollment enrollment = Enrollment.builder()
                .user(user)
                .course(course)
                .enrolledAt(Instant.now())
                .build();

        Enrollment saved = enrollmentRepository.save(enrollment);
        log.info("Admin manually enrolled user ID {} into course ID {}", userId, courseId);
        return toEnrollmentDto(saved);
    }

    private CourseDto toCourseDto(Course course) {
        long totalLessons = lessonRepository.countByCourseId(course.getId());
        return CourseDto.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .slug(course.getSlug())
                .active(course.isActive())
                .createdAt(course.getCreatedAt())
                .totalLessons(totalLessons)
                .build();
    }

    private LessonDetailDto toLessonDetailDto(Lesson lesson, Course course) {
        return LessonDetailDto.builder()
                .id(lesson.getId())
                .courseId(course.getId())
                .courseTitle(course.getTitle())
                .courseSlug(course.getSlug())
                .title(lesson.getTitle())
                .content(lesson.getContent())
                .youtubeUrl(lesson.getYoutubeUrl())
                .dayNumber(lesson.getDayNumber())
                .sortOrder(lesson.getSortOrder())
                .accessible(true)
                .opensAt(Instant.now())
                .build();
    }

    private EnrollmentDto toEnrollmentDto(Enrollment enrollment) {
        return EnrollmentDto.builder()
                .id(enrollment.getId())
                .userId(enrollment.getUser().getId())
                .userEmail(enrollment.getUser().getEmail())
                .userName(enrollment.getUser().getName())
                .courseId(enrollment.getCourse().getId())
                .courseTitle(enrollment.getCourse().getTitle())
                .courseSlug(enrollment.getCourse().getSlug())
                .enrolledAt(enrollment.getEnrolledAt())
                .build();
    }
}
