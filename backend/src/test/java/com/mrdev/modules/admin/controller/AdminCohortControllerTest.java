package com.mrdev.modules.admin.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mrdev.modules.admin.dto.CreateCohortRequest;
import com.mrdev.modules.admin.dto.UpdateCohortRequest;
import com.mrdev.modules.ai.rag.repository.GlossaryEmbeddingRepository;
import com.mrdev.modules.ai.rag.repository.LessonChunkRepository;
import com.mrdev.modules.audit.repository.AuditLogRepository;
import com.mrdev.modules.auth.model.Role;
import com.mrdev.modules.auth.model.User;
import com.mrdev.modules.auth.repository.UserRepository;
import com.mrdev.modules.auth.service.JwtTokenProvider;
import com.mrdev.modules.automation.repository.OutboxEventRepository;
import com.mrdev.modules.course.model.Cohort;
import com.mrdev.modules.course.model.Course;
import com.mrdev.modules.course.repository.CohortRepository;
import com.mrdev.modules.course.repository.CourseModuleRepository;
import com.mrdev.modules.course.repository.CourseRepository;
import com.mrdev.modules.course.repository.EnrollmentRepository;
import com.mrdev.modules.homework.repository.HomeworkSubmissionRepository;
import com.mrdev.modules.lesson.repository.LessonMaterialRepository;
import com.mrdev.modules.lesson.repository.LessonProgressRepository;
import com.mrdev.modules.lesson.repository.LessonRepository;
import com.mrdev.modules.quiz.repository.QuizQuestionOptionRepository;
import com.mrdev.modules.quiz.repository.QuizQuestionRepository;
import com.mrdev.modules.quiz.repository.QuizRepository;
import com.mrdev.modules.quiz.repository.QuizSubmissionRepository;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminCohortControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CourseModuleRepository courseModuleRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private CohortRepository cohortRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private LessonMaterialRepository lessonMaterialRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuizQuestionRepository quizQuestionRepository;

    @Autowired
    private QuizQuestionOptionRepository quizQuestionOptionRepository;

    @Autowired
    private QuizSubmissionRepository quizSubmissionRepository;

    @Autowired
    private LessonProgressRepository lessonProgressRepository;

    @Autowired
    private LessonChunkRepository lessonChunkRepository;

    @Autowired
    private GlossaryEmbeddingRepository glossaryEmbeddingRepository;

    @Autowired
    private HomeworkSubmissionRepository homeworkSubmissionRepository;

    @Autowired
    private OutboxEventRepository outboxEventRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User adminUser;
    private String adminToken;
    private Course testCourse;

    @BeforeEach
    void setUp() {
        auditLogRepository.deleteAll();
        outboxEventRepository.deleteAll();
        homeworkSubmissionRepository.deleteAll();
        quizSubmissionRepository.deleteAll();
        quizQuestionOptionRepository.deleteAll();
        quizQuestionRepository.deleteAll();
        quizRepository.deleteAll();
        lessonMaterialRepository.deleteAll();
        lessonProgressRepository.deleteAll();
        lessonChunkRepository.deleteAll();
        glossaryEmbeddingRepository.deleteAll();
        cohortRepository.deleteAll();
        lessonRepository.deleteAll();
        courseModuleRepository.deleteAll();
        enrollmentRepository.deleteAll();
        courseRepository.deleteAll();
        userRepository.deleteAll();

        adminUser = User.builder()
                .email("cohortadmin@test.com")
                .name("Cohort Admin")
                .role(Role.ADMIN)
                .build();
        adminUser = userRepository.save(adminUser);
        adminToken = jwtTokenProvider.generateToken(adminUser);

        testCourse = Course.builder()
                .title("Advanced Architecture")
                .slug("advanced-arch")
                .active(true)
                .build();
        testCourse = courseRepository.save(testCourse);
    }

    @Test
    @DisplayName("POST /v1/admin/courses/{courseId}/cohorts creates new cohort")
    void createCohort_ShouldSucceed() throws Exception {
        CreateCohortRequest request = CreateCohortRequest.builder()
                .name("Autumn 2026 Batch")
                .startDate(Instant.now().plus(1, ChronoUnit.DAYS))
                .endDate(Instant.now().plus(60, ChronoUnit.DAYS))
                .maxStudents(45)
                .isActive(true)
                .build();

        mockMvc.perform(post("/v1/admin/courses/" + testCourse.getId() + "/cohorts")
                        .cookie(new Cookie("MrDev_token", adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.name", is("Autumn 2026 Batch")))
                .andExpect(jsonPath("$.data.maxStudents", is(45)))
                .andExpect(jsonPath("$.data.courseId", is(testCourse.getId().intValue())));
    }

    @Test
    @DisplayName("GET /v1/admin/cohorts and PUT /v1/admin/cohorts/{cohortId}")
    void getAndUpdateCohort_ShouldWork() throws Exception {
        Cohort cohort = Cohort.builder()
                .course(testCourse)
                .name("Spring 2026 Batch")
                .startDate(Instant.now())
                .maxStudents(30)
                .isActive(true)
                .build();
        cohort = cohortRepository.save(cohort);

        // GET all
        mockMvc.perform(get("/v1/admin/cohorts")
                        .cookie(new Cookie("MrDev_token", adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].name", is("Spring 2026 Batch")));

        // UPDATE
        UpdateCohortRequest updateRequest = UpdateCohortRequest.builder()
                .name("Updated Spring 2026 Batch")
                .startDate(Instant.now())
                .maxStudents(50)
                .isActive(false)
                .build();

        mockMvc.perform(put("/v1/admin/cohorts/" + cohort.getId())
                        .cookie(new Cookie("MrDev_token", adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name", is("Updated Spring 2026 Batch")))
                .andExpect(jsonPath("$.data.maxStudents", is(50)))
                .andExpect(jsonPath("$.data.isActive", is(false)));

        // DELETE
        mockMvc.perform(delete("/v1/admin/cohorts/" + cohort.getId())
                        .cookie(new Cookie("MrDev_token", adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }
}
