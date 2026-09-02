package com.mrdev.modules.admin.service;

import com.mrdev.common.exception.ApiException;
import com.mrdev.common.exception.ResourceNotFoundException;
import com.mrdev.common.util.SecurityUtils;
import com.mrdev.modules.admin.dto.*;
import com.mrdev.modules.audit.service.AuditService;
import com.mrdev.modules.course.dto.CourseModuleDto;
import com.mrdev.modules.course.model.Course;
import com.mrdev.modules.course.model.CourseModule;
import com.mrdev.modules.course.repository.CourseModuleRepository;
import com.mrdev.modules.course.repository.CourseRepository;
import com.mrdev.modules.lesson.dto.CreateLessonRequest;
import com.mrdev.modules.lesson.dto.LessonDetailDto;
import com.mrdev.modules.lesson.dto.LessonMaterialDto;
import com.mrdev.modules.lesson.dto.LessonSummaryDto;
import com.mrdev.modules.lesson.dto.UpdateLessonRequest;
import com.mrdev.modules.lesson.model.Lesson;
import com.mrdev.modules.lesson.model.LessonMaterial;
import com.mrdev.modules.lesson.model.LessonType;
import com.mrdev.modules.lesson.repository.LessonMaterialRepository;
import com.mrdev.modules.lesson.repository.LessonRepository;
import com.mrdev.modules.quiz.dto.QuizDto;
import com.mrdev.modules.quiz.dto.QuizOptionDto;
import com.mrdev.modules.quiz.dto.QuizQuestionDto;
import com.mrdev.modules.quiz.model.QuestionType;
import com.mrdev.modules.quiz.model.Quiz;
import com.mrdev.modules.quiz.model.QuizQuestion;
import com.mrdev.modules.quiz.model.QuizQuestionOption;
import com.mrdev.modules.quiz.repository.QuizQuestionOptionRepository;
import com.mrdev.modules.quiz.repository.QuizQuestionRepository;
import com.mrdev.modules.quiz.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminCurriculumService {

    private final CourseRepository courseRepository;
    private final CourseModuleRepository courseModuleRepository;
    private final LessonRepository lessonRepository;
    private final LessonMaterialRepository lessonMaterialRepository;
    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final QuizQuestionOptionRepository quizQuestionOptionRepository;
    private final AuditService auditService;

    // ==========================================
    // MODULE OPERATIONS
    // ==========================================

    @Transactional(readOnly = true)
    public List<CourseModuleDto> getModulesForCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));

        List<CourseModule> modules = courseModuleRepository.findAllByCourseIdWithLessons(courseId);
        return modules.stream().map(this::toCourseModuleDto).toList();
    }

    @Transactional
    public CourseModuleDto createModule(Long courseId, CreateModuleRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));

        int sortOrder = request.getSortOrder() != null ? request.getSortOrder() : 1;
        if (request.getSortOrder() == null || request.getSortOrder() <= 0) {
            List<CourseModule> existing = courseModuleRepository.findByCourseIdOrderBySortOrderAsc(courseId);
            sortOrder = existing.size() + 1;
        }

        CourseModule module = CourseModule.builder()
                .course(course)
                .title(request.getTitle())
                .description(request.getDescription())
                .sortOrder(sortOrder)
                .isFreePreview(Boolean.TRUE.equals(request.getIsFreePreview()))
                .build();

        CourseModule saved = courseModuleRepository.save(module);
        log.info("Admin created module ID: {} in course ID: {}", saved.getId(), courseId);

        Long adminId = SecurityUtils.getCurrentUserIdOptional().orElse(null);
        auditService.logAction(adminId, "ADMIN_CREATE_MODULE", "CourseModule", saved.getId(), "Title: " + saved.getTitle(), null);

        return toCourseModuleDto(saved);
    }

    @Transactional
    public CourseModuleDto updateModule(Long moduleId, UpdateModuleRequest request) {
        CourseModule module = courseModuleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("CourseModule", "id", moduleId));

        module.setTitle(request.getTitle());
        if (request.getDescription() != null) {
            module.setDescription(request.getDescription());
        }
        if (request.getSortOrder() != null) {
            module.setSortOrder(request.getSortOrder());
        }
        if (request.getIsFreePreview() != null) {
            module.setIsFreePreview(request.getIsFreePreview());
        }

        CourseModule saved = courseModuleRepository.save(module);
        log.info("Admin updated module ID: {}", moduleId);

        Long adminId = SecurityUtils.getCurrentUserIdOptional().orElse(null);
        auditService.logAction(adminId, "ADMIN_UPDATE_MODULE", "CourseModule", moduleId, "Title: " + saved.getTitle(), null);

        return toCourseModuleDto(saved);
    }

    @Transactional
    public void deleteModule(Long moduleId) {
        CourseModule module = courseModuleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("CourseModule", "id", moduleId));

        courseModuleRepository.delete(module);
        log.info("Admin deleted module ID: {}", moduleId);

        Long adminId = SecurityUtils.getCurrentUserIdOptional().orElse(null);
        auditService.logAction(adminId, "ADMIN_DELETE_MODULE", "CourseModule", moduleId, "Deleted: " + module.getTitle(), null);
    }

    @Transactional
    public List<CourseModuleDto> reorderModules(Long courseId, List<ReorderItemRequest> items) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));

        List<CourseModule> modules = courseModuleRepository.findByCourseIdOrderBySortOrderAsc(courseId);
        Map<Long, CourseModule> moduleMap = modules.stream().collect(Collectors.toMap(CourseModule::getId, m -> m));

        // Phase 1: assign temporary negative sort_orders to avoid any unique constraints or conflicts
        for (int i = 0; i < items.size(); i++) {
            CourseModule mod = moduleMap.get(items.get(i).getId());
            if (mod != null) {
                mod.setSortOrder(-1000 - i);
            }
        }
        courseModuleRepository.flush();

        // Phase 2: assign positive sequential 1-based sort orders
        for (int i = 0; i < items.size(); i++) {
            ReorderItemRequest item = items.get(i);
            CourseModule mod = moduleMap.get(item.getId());
            if (mod != null) {
                int targetOrder = item.getSortOrder() != null && item.getSortOrder() > 0 ? item.getSortOrder() : (i + 1);
                mod.setSortOrder(targetOrder);
            }
        }
        courseModuleRepository.saveAll(modules);
        courseModuleRepository.flush();

        // Recalculate all lessons dayNumber and sortOrder across modules in sequential order
        recalculateCourseDripOrder(courseId);

        Long adminId = SecurityUtils.getCurrentUserIdOptional().orElse(null);
        auditService.logAction(adminId, "ADMIN_REORDER_MODULES", "Course", courseId, "Reordered " + items.size() + " modules", null);

        return courseModuleRepository.findAllByCourseIdWithLessons(courseId).stream()
                .map(this::toCourseModuleDto)
                .toList();
    }

    // ==========================================
    // LESSON OPERATIONS
    // ==========================================

    @Transactional
    public LessonDetailDto createLesson(Long courseId, CreateLessonRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));

        CourseModule module = null;
        if (request.getModuleId() != null) {
            module = courseModuleRepository.findById(request.getModuleId())
                    .orElseThrow(() -> new ResourceNotFoundException("CourseModule", "id", request.getModuleId()));
        } else {
            List<CourseModule> modules = courseModuleRepository.findByCourseIdOrderBySortOrderAsc(courseId);
            if (!modules.isEmpty()) {
                module = modules.get(0);
            }
        }

        int dayNumber = request.getDayNumber();
        if (dayNumber > 0 && lessonRepository.existsByCourseIdAndDayNumber(courseId, dayNumber)) {
            throw new ApiException("Lesson with day number " + dayNumber + " already exists in this course", HttpStatus.CONFLICT);
        }
        if (dayNumber <= 0) {
            // Pick next available dayNumber
            List<Lesson> allLessons = lessonRepository.findByCourseIdOrderBySortOrderAscDayNumberAsc(courseId);
            dayNumber = allLessons.stream().mapToInt(Lesson::getDayNumber).max().orElse(0) + 1;
        }

        Lesson lesson = Lesson.builder()
                .course(course)
                .module(module)
                .title(request.getTitle())
                .lessonType(request.getLessonType() != null ? request.getLessonType() : LessonType.VIDEO)
                .durationMinutes(request.getDurationMinutes() != null ? request.getDurationMinutes() : 0)
                .isFreePreview(Boolean.TRUE.equals(request.getIsFreePreview()))
                .isPublished(request.getIsPublished() == null || Boolean.TRUE.equals(request.getIsPublished()))
                .content(request.getContent())
                .youtubeUrl(request.getYoutubeUrl())
                .dayNumber(dayNumber)
                .sortOrder(request.getSortOrder() > 0 ? request.getSortOrder() : dayNumber)
                .build();

        Lesson saved = lessonRepository.save(lesson);
        log.info("Admin created lesson ID: {} in course ID: {}", saved.getId(), courseId);

        Long adminId = SecurityUtils.getCurrentUserIdOptional().orElse(null);
        auditService.logAction(adminId, "ADMIN_CREATE_LESSON", "Lesson", saved.getId(), "Title: " + saved.getTitle(), null);

        return toLessonDetailDto(saved, course);
    }

    @Transactional
    public LessonDetailDto updateLesson(Long lessonId, UpdateLessonRequest request) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", lessonId));

        Long courseId = lesson.getCourse().getId();
        if (request.getDayNumber() > 0 && request.getDayNumber() != lesson.getDayNumber()) {
            if (lessonRepository.existsByCourseIdAndDayNumberAndIdNot(courseId, request.getDayNumber(), lessonId)) {
                throw new ApiException("Lesson for day " + request.getDayNumber() + " already exists in this course", HttpStatus.CONFLICT);
            }
            lesson.setDayNumber(request.getDayNumber());
        }

        lesson.setTitle(request.getTitle());
        if (request.getContent() != null) {
            lesson.setContent(request.getContent());
        }
        if (request.getYoutubeUrl() != null) {
            lesson.setYoutubeUrl(request.getYoutubeUrl());
        }
        if (request.getSortOrder() > 0) {
            lesson.setSortOrder(request.getSortOrder());
        }
        if (request.getLessonType() != null) {
            lesson.setLessonType(request.getLessonType());
        }
        if (request.getDurationMinutes() != null) {
            lesson.setDurationMinutes(request.getDurationMinutes());
        }
        if (request.getIsFreePreview() != null) {
            lesson.setIsFreePreview(request.getIsFreePreview());
        }
        if (request.getIsPublished() != null) {
            lesson.setIsPublished(request.getIsPublished());
        }
        if (request.getModuleId() != null) {
            CourseModule module = courseModuleRepository.findById(request.getModuleId())
                    .orElseThrow(() -> new ResourceNotFoundException("CourseModule", "id", request.getModuleId()));
            lesson.setModule(module);
        }

        Lesson updated = lessonRepository.save(lesson);
        log.info("Admin updated lesson ID: {}", lessonId);

        Long adminId = SecurityUtils.getCurrentUserIdOptional().orElse(null);
        auditService.logAction(adminId, "ADMIN_UPDATE_LESSON", "Lesson", lessonId, "Title: " + updated.getTitle(), null);

        return toLessonDetailDto(updated, lesson.getCourse());
    }

    @Transactional
    public void deleteLesson(Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", lessonId));

        Long courseId = lesson.getCourse().getId();
        lessonRepository.delete(lesson);
        log.info("Admin deleted lesson ID: {}", lessonId);

        // Cleanly re-index remaining lessons
        recalculateCourseDripOrder(courseId);

        Long adminId = SecurityUtils.getCurrentUserIdOptional().orElse(null);
        auditService.logAction(adminId, "ADMIN_DELETE_LESSON", "Lesson", lessonId, "Deleted: " + lesson.getTitle(), null);
    }

    @Transactional
    public List<LessonDetailDto> reorderLessons(Long courseId, List<ReorderItemRequest> items) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));

        List<Lesson> allLessons = lessonRepository.findByCourseIdOrderBySortOrderAscDayNumberAsc(courseId);
        Map<Long, Lesson> lessonMap = allLessons.stream().collect(Collectors.toMap(Lesson::getId, l -> l));

        // Phase 1: Set temporary negative day_number and sort_order to prevent UNIQUE constraint violation
        for (int i = 0; i < items.size(); i++) {
            ReorderItemRequest item = items.get(i);
            Lesson lesson = lessonMap.get(item.getId());
            if (lesson != null) {
                lesson.setDayNumber(-10000 - i);
                lesson.setSortOrder(-10000 - i);
                if (item.getModuleId() != null) {
                    CourseModule mod = courseModuleRepository.findById(item.getModuleId()).orElse(null);
                    if (mod != null) {
                        lesson.setModule(mod);
                    }
                }
            }
        }
        lessonRepository.flush();

        // Phase 2: Re-assign sequential day numbers and sort orders
        for (int i = 0; i < items.size(); i++) {
            ReorderItemRequest item = items.get(i);
            Lesson lesson = lessonMap.get(item.getId());
            if (lesson != null) {
                int targetOrder = item.getSortOrder() != null && item.getSortOrder() > 0 ? item.getSortOrder() : (i + 1);
                lesson.setSortOrder(targetOrder);
                lesson.setDayNumber(i + 1);
            }
        }
        lessonRepository.saveAll(allLessons);
        lessonRepository.flush();

        Long adminId = SecurityUtils.getCurrentUserIdOptional().orElse(null);
        auditService.logAction(adminId, "ADMIN_REORDER_LESSONS", "Course", courseId, "Reordered " + items.size() + " lessons", null);

        return lessonRepository.findByCourseIdOrderBySortOrderAscDayNumberAsc(courseId).stream()
                .map(l -> toLessonDetailDto(l, course))
                .toList();
    }

    // ==========================================
    // MATERIAL OPERATIONS
    // ==========================================

    @Transactional
    public LessonMaterialDto addMaterial(Long lessonId, CreateMaterialRequest request) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", lessonId));

        int sortOrder = request.getSortOrder() != null ? request.getSortOrder() : 1;
        LessonMaterial material = LessonMaterial.builder()
                .lesson(lesson)
                .title(request.getTitle())
                .materialType(request.getMaterialType())
                .url(request.getUrl())
                .fileSizeBytes(request.getFileSizeBytes())
                .sortOrder(sortOrder)
                .build();

        LessonMaterial saved = lessonMaterialRepository.save(material);
        log.info("Admin added material ID: {} to lesson ID: {}", saved.getId(), lessonId);

        Long adminId = SecurityUtils.getCurrentUserIdOptional().orElse(null);
        auditService.logAction(adminId, "ADMIN_ADD_MATERIAL", "LessonMaterial", saved.getId(), "Title: " + saved.getTitle(), null);

        return toLessonMaterialDto(saved);
    }

    @Transactional
    public void deleteMaterial(Long materialId) {
        LessonMaterial material = lessonMaterialRepository.findById(materialId)
                .orElseThrow(() -> new ResourceNotFoundException("LessonMaterial", "id", materialId));

        lessonMaterialRepository.delete(material);
        log.info("Admin deleted material ID: {}", materialId);

        Long adminId = SecurityUtils.getCurrentUserIdOptional().orElse(null);
        auditService.logAction(adminId, "ADMIN_DELETE_MATERIAL", "LessonMaterial", materialId, "Deleted: " + material.getTitle(), null);
    }

    // ==========================================
    // QUIZ OPERATIONS
    // ==========================================

    @Transactional(readOnly = true)
    public QuizDto getQuizByLesson(Long lessonId) {
        Quiz quiz = quizRepository.findByLessonId(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", "lessonId", lessonId));
        return toQuizDto(quiz);
    }

    @Transactional
    public QuizDto createOrUpdateQuiz(Long lessonId, CreateQuizRequest request) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", lessonId));

        Quiz quiz = quizRepository.findByLessonId(lessonId).orElseGet(() -> Quiz.builder()
                .lesson(lesson)
                .build());

        quiz.setTitle(request.getTitle());
        quiz.setDescription(request.getDescription());
        quiz.setPassingScorePercentage(request.getPassingScorePercentage() != null ? request.getPassingScorePercentage() : 80);
        quiz.setMaxAttempts(request.getMaxAttempts() != null ? request.getMaxAttempts() : 3);
        quiz.setTimeLimitSeconds(request.getTimeLimitSeconds() != null ? request.getTimeLimitSeconds() : 600);

        if (request.getQuestions() != null) {
            if (quiz.getQuestions() == null) {
                quiz.setQuestions(new ArrayList<>());
            } else {
                quiz.getQuestions().clear();
            }

            for (int qIdx = 0; qIdx < request.getQuestions().size(); qIdx++) {
                CreateQuizQuestionRequest qReq = request.getQuestions().get(qIdx);
                QuizQuestion question = QuizQuestion.builder()
                        .quiz(quiz)
                        .questionText(qReq.getQuestionText())
                        .questionType(qReq.getQuestionType() != null ? qReq.getQuestionType() : QuestionType.SINGLE_CHOICE)
                        .explanation(qReq.getExplanation())
                        .points(qReq.getPoints() != null ? qReq.getPoints() : 1)
                        .sortOrder(qReq.getSortOrder() != null ? qReq.getSortOrder() : (qIdx + 1))
                        .options(new ArrayList<>())
                        .build();

                if (qReq.getOptions() != null) {
                    for (int oIdx = 0; oIdx < qReq.getOptions().size(); oIdx++) {
                        CreateQuizOptionRequest oReq = qReq.getOptions().get(oIdx);
                        QuizQuestionOption option = QuizQuestionOption.builder()
                                .question(question)
                                .optionText(oReq.getOptionText())
                                .isCorrect(Boolean.TRUE.equals(oReq.getIsCorrect()))
                                .sortOrder(oReq.getSortOrder() != null ? oReq.getSortOrder() : (oIdx + 1))
                                .build();
                        question.getOptions().add(option);
                    }
                }
                quiz.getQuestions().add(question);
            }
        }

        Quiz finalSaved = quizRepository.saveAndFlush(quiz);
        log.info("Admin created/updated quiz ID: {} for lesson ID: {}", finalSaved.getId(), lessonId);

        Long adminId = SecurityUtils.getCurrentUserIdOptional().orElse(null);
        auditService.logAction(adminId, "ADMIN_SAVE_QUIZ", "Quiz", finalSaved.getId(), "Lesson: " + lesson.getTitle(), null);

        return toQuizDto(finalSaved);
    }

    @Transactional
    public void deleteQuiz(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", "id", quizId));

        quizRepository.delete(quiz);
        log.info("Admin deleted quiz ID: {}", quizId);

        Long adminId = SecurityUtils.getCurrentUserIdOptional().orElse(null);
        auditService.logAction(adminId, "ADMIN_DELETE_QUIZ", "Quiz", quizId, "Deleted: " + quiz.getTitle(), null);
    }

    // ==========================================
    // HELPERS & RECALCULATION
    // ==========================================

    private void recalculateCourseDripOrder(Long courseId) {
        List<CourseModule> modules = courseModuleRepository.findAllByCourseIdWithLessons(courseId);
        List<Lesson> orderedLessons = new ArrayList<>();

        for (CourseModule mod : modules) {
            orderedLessons.addAll(mod.getLessons());
        }

        if (orderedLessons.isEmpty()) {
            orderedLessons = lessonRepository.findByCourseIdOrderBySortOrderAscDayNumberAsc(courseId);
        }

        // Two-phase update for clean sequential dayNumber
        for (int i = 0; i < orderedLessons.size(); i++) {
            orderedLessons.get(i).setDayNumber(-20000 - i);
        }
        lessonRepository.flush();

        for (int i = 0; i < orderedLessons.size(); i++) {
            orderedLessons.get(i).setDayNumber(i + 1);
            orderedLessons.get(i).setSortOrder(i + 1);
        }
        lessonRepository.saveAll(orderedLessons);
        lessonRepository.flush();
    }

    public CourseModuleDto toCourseModuleDto(CourseModule module) {
        List<LessonSummaryDto> lessonDtos = module.getLessons() != null ? module.getLessons().stream()
                .map(this::toLessonSummaryDto)
                .toList() : List.of();

        return CourseModuleDto.builder()
                .id(module.getId())
                .courseId(module.getCourse().getId())
                .title(module.getTitle())
                .description(module.getDescription())
                .sortOrder(module.getSortOrder())
                .isFreePreview(module.getIsFreePreview())
                .lessonsCount(lessonDtos.size())
                .completedLessonsCount(0)
                .lessons(lessonDtos)
                .build();
    }

    public LessonSummaryDto toLessonSummaryDto(Lesson lesson) {
        return LessonSummaryDto.builder()
                .id(lesson.getId())
                .courseId(lesson.getCourse().getId())
                .moduleId(lesson.getModule() != null ? lesson.getModule().getId() : null)
                .title(lesson.getTitle())
                .lessonType(lesson.getLessonType())
                .durationMinutes(lesson.getDurationMinutes())
                .isFreePreview(lesson.getIsFreePreview())
                .isPublished(lesson.getIsPublished() != null ? lesson.getIsPublished() : true)
                .content(lesson.getContent())
                .youtubeUrl(lesson.getYoutubeUrl())
                .dayNumber(lesson.getDayNumber())
                .sortOrder(lesson.getSortOrder())
                .accessible(true)
                .opensAt(Instant.now())
                .completed(false)
                .completedAt(null)
                .build();
    }

    public LessonDetailDto toLessonDetailDto(Lesson lesson, Course course) {
        List<LessonMaterialDto> materials = lessonMaterialRepository.findByLessonIdOrderBySortOrderAsc(lesson.getId()).stream()
                .map(this::toLessonMaterialDto)
                .toList();

        boolean hasQuiz = quizRepository.findByLessonId(lesson.getId()).isPresent();

        return LessonDetailDto.builder()
                .id(lesson.getId())
                .courseId(course.getId())
                .courseTitle(course.getTitle())
                .courseSlug(course.getSlug())
                .moduleId(lesson.getModule() != null ? lesson.getModule().getId() : null)
                .moduleTitle(lesson.getModule() != null ? lesson.getModule().getTitle() : null)
                .title(lesson.getTitle())
                .lessonType(lesson.getLessonType())
                .durationMinutes(lesson.getDurationMinutes())
                .isFreePreview(lesson.getIsFreePreview())
                .isPublished(lesson.getIsPublished() != null ? lesson.getIsPublished() : true)
                .content(lesson.getContent())
                .youtubeUrl(lesson.getYoutubeUrl())
                .dayNumber(lesson.getDayNumber())
                .sortOrder(lesson.getSortOrder())
                .accessible(true)
                .opensAt(Instant.now())
                .completed(false)
                .completedAt(null)
                .hasQuiz(hasQuiz)
                .materials(materials)
                .build();
    }

    public LessonMaterialDto toLessonMaterialDto(LessonMaterial material) {
        return LessonMaterialDto.builder()
                .id(material.getId())
                .title(material.getTitle())
                .materialType(material.getMaterialType())
                .url(material.getUrl())
                .fileSizeBytes(material.getFileSizeBytes())
                .sortOrder(material.getSortOrder())
                .build();
    }

    public QuizDto toQuizDto(Quiz quiz) {
        List<QuizQuestionDto> questions = quiz.getQuestions() != null ? quiz.getQuestions().stream()
                .map(q -> QuizQuestionDto.builder()
                        .id(q.getId())
                        .questionText(q.getQuestionText())
                        .questionType(q.getQuestionType())
                        .explanation(q.getExplanation())
                        .points(q.getPoints())
                        .sortOrder(q.getSortOrder())
                        .options(q.getOptions() != null ? q.getOptions().stream()
                                .map(o -> QuizOptionDto.builder()
                                        .id(o.getId())
                                        .optionText(o.getOptionText())
                                        .isCorrect(o.getIsCorrect())
                                        .sortOrder(o.getSortOrder())
                                        .build())
                                .toList() : List.of())
                        .build())
                .toList() : List.of();

        return QuizDto.builder()
                .id(quiz.getId())
                .lessonId(quiz.getLesson().getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .passingScorePercentage(quiz.getPassingScorePercentage())
                .maxAttempts(quiz.getMaxAttempts())
                .timeLimitSeconds(quiz.getTimeLimitSeconds())
                .questionsCount(questions.size())
                .questions(questions)
                .build();
    }
}
