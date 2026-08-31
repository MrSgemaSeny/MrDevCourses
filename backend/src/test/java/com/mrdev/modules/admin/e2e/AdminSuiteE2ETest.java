package com.mrdev.modules.admin.e2e;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mrdev.modules.admin.dto.*;
import com.mrdev.modules.ai.rag.repository.GlossaryEmbeddingRepository;
import com.mrdev.modules.ai.rag.repository.LessonChunkRepository;
import com.mrdev.modules.audit.model.AuditLog;
import com.mrdev.modules.audit.repository.AuditLogRepository;
import com.mrdev.modules.auth.model.Role;
import com.mrdev.modules.auth.model.User;
import com.mrdev.modules.auth.repository.UserRepository;
import com.mrdev.modules.auth.service.JwtTokenProvider;
import com.mrdev.modules.automation.model.OutboxEvent;
import com.mrdev.modules.automation.model.OutboxStatus;
import com.mrdev.modules.automation.repository.OutboxEventRepository;
import com.mrdev.modules.course.dto.CreateCourseRequest;
import com.mrdev.modules.course.dto.UpdateCourseRequest;
import com.mrdev.modules.course.model.Cohort;
import com.mrdev.modules.course.model.Course;
import com.mrdev.modules.course.model.CourseModule;
import com.mrdev.modules.course.model.Enrollment;
import com.mrdev.modules.course.repository.CohortRepository;
import com.mrdev.modules.course.repository.CourseModuleRepository;
import com.mrdev.modules.course.repository.CourseRepository;
import com.mrdev.modules.course.repository.EnrollmentRepository;
import com.mrdev.modules.homework.repository.HomeworkSubmissionRepository;
import com.mrdev.modules.lesson.dto.CreateLessonRequest;
import com.mrdev.modules.lesson.dto.UpdateLessonRequest;
import com.mrdev.modules.lesson.model.Lesson;
import com.mrdev.modules.lesson.model.LessonMaterial;
import com.mrdev.modules.lesson.model.LessonProgress;
import com.mrdev.modules.lesson.model.LessonType;
import com.mrdev.modules.lesson.model.MaterialType;
import com.mrdev.modules.lesson.repository.LessonMaterialRepository;
import com.mrdev.modules.lesson.repository.LessonProgressRepository;
import com.mrdev.modules.lesson.repository.LessonRepository;
import com.mrdev.modules.quiz.model.QuestionType;
import com.mrdev.modules.quiz.model.Quiz;
import com.mrdev.modules.quiz.model.QuizQuestion;
import com.mrdev.modules.quiz.model.QuizQuestionOption;
import com.mrdev.modules.quiz.repository.QuizQuestionOptionRepository;
import com.mrdev.modules.quiz.repository.QuizQuestionRepository;
import com.mrdev.modules.quiz.repository.QuizRepository;
import com.mrdev.modules.quiz.repository.QuizSubmissionRepository;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminSuiteE2ETest {

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
    private CohortRepository cohortRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

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

    private User primaryAdmin;
    private User secondaryAdmin;
    private User studentUser;
    private String primaryAdminToken;
    private String secondaryAdminToken;
    private String studentToken;

    @BeforeEach
    void cleanDatabaseAndSeedPrincipals() {
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
        lessonRepository.deleteAll();
        courseModuleRepository.deleteAll();
        cohortRepository.deleteAll();
        enrollmentRepository.deleteAll();
        courseRepository.deleteAll();
        userRepository.deleteAll();

        primaryAdmin = userRepository.save(User.builder()
                .email("lead.admin@mrdevcourses.com")
                .name("Senior Tech Lead Admin")
                .role(Role.ADMIN)
                .currentStreak(10)
                .lastActiveDate(LocalDate.now())
                .build());
        primaryAdminToken = jwtTokenProvider.generateToken(primaryAdmin);

        secondaryAdmin = userRepository.save(User.builder()
                .email("ops.admin@mrdevcourses.com")
                .name("Operations Admin")
                .role(Role.ADMIN)
                .currentStreak(5)
                .lastActiveDate(LocalDate.now())
                .build());
        secondaryAdminToken = jwtTokenProvider.generateToken(secondaryAdmin);

        studentUser = userRepository.save(User.builder()
                .email("alex.student@gmail.com")
                .name("Alex Student")
                .role(Role.STUDENT)
                .currentStreak(3)
                .lastActiveDate(LocalDate.now())
                .build());
        studentToken = jwtTokenProvider.generateToken(studentUser);
    }

    private Cookie adminCookie() {
        return new Cookie("MrDev_token", primaryAdminToken);
    }

    private Cookie secondaryAdminCookie() {
        return new Cookie("MrDev_token", secondaryAdminToken);
    }

    private Cookie studentCookie() {
        return new Cookie("MrDev_token", studentToken);
    }

    @Nested
    @DisplayName("Tier 1: Feature Coverage (Opaque-Box Endpoints)")
    class Tier1FeatureCoverageTests {

        @Test
        @DisplayName("F1: Course Management CRUD and instant Publish/Draft toggle")
        void testCourseCrudLifecycle() throws Exception {
            CreateCourseRequest createReq = CreateCourseRequest.builder()
                    .title("Reactive Spring Architecture")
                    .slug("reactive-spring-arch")
                    .description("Mastering Spring Boot WebFlux and R2DBC")
                    .active(false)
                    .build();

            String createRes = mockMvc.perform(post("/v1/admin/courses")
                            .cookie(adminCookie())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(createReq)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data.title", is("Reactive Spring Architecture")))
                    .andExpect(jsonPath("$.data.slug", is("reactive-spring-arch")))
                    .andExpect(jsonPath("$.data.active", is(false)))
                    .andReturn().getResponse().getContentAsString();

            Long courseId = objectMapper.readTree(createRes).path("data").path("id").asLong();

            // Read
            mockMvc.perform(get("/v1/admin/courses").cookie(adminCookie()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data", hasSize(1)))
                    .andExpect(jsonPath("$.data[0].id", is(courseId.intValue())));

            // Update & Publish
            UpdateCourseRequest updateReq = UpdateCourseRequest.builder()
                    .title("Reactive Spring Architecture - Production Edition")
                    .slug("reactive-spring-arch")
                    .description("Updated deep dive description")
                    .active(true)
                    .build();

            mockMvc.perform(put("/v1/admin/courses/" + courseId)
                            .cookie(adminCookie())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updateReq)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.title", is("Reactive Spring Architecture - Production Edition")))
                    .andExpect(jsonPath("$.data.active", is(true)));

            // Delete
            mockMvc.perform(delete("/v1/admin/courses/" + courseId).cookie(adminCookie()))
                    .andExpect(status().isOk());

            assertThat(courseRepository.findById(courseId)).isEmpty();
        }

        @Test
        @DisplayName("F2 & F4: CourseModule CRUD and Batch Drag-and-Drop Reorder")
        void testModuleCrudAndReorder() throws Exception {
            Course course = courseRepository.save(Course.builder()
                    .title("Distributed Systems")
                    .slug("dist-systems")
                    .active(true)
                    .build());

            CreateModuleRequest mod1Req = CreateModuleRequest.builder()
                    .title("Module 1: Consensus")
                    .description("Paxos and Raft")
                    .sortOrder(1)
                    .isFreePreview(true)
                    .build();

            String mod1Res = mockMvc.perform(post("/v1/admin/courses/" + course.getId() + "/modules")
                            .cookie(adminCookie())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(mod1Req)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.data.title", is("Module 1: Consensus")))
                    .andReturn().getResponse().getContentAsString();

            Long mod1Id = objectMapper.readTree(mod1Res).path("data").path("id").asLong();

            CreateModuleRequest mod2Req = CreateModuleRequest.builder()
                    .title("Module 2: Replication")
                    .sortOrder(2)
                    .isFreePreview(false)
                    .build();

            String mod2Res = mockMvc.perform(post("/v1/admin/courses/" + course.getId() + "/modules")
                            .cookie(adminCookie())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(mod2Req)))
                    .andExpect(status().isCreated())
                    .andReturn().getResponse().getContentAsString();

            Long mod2Id = objectMapper.readTree(mod2Res).path("data").path("id").asLong();

            // Reorder Modules (swap order: mod2 -> order 1, mod1 -> order 2)
            List<ReorderItemRequest> reorderReq = List.of(
                    ReorderItemRequest.builder().id(mod2Id).sortOrder(1).build(),
                    ReorderItemRequest.builder().id(mod1Id).sortOrder(2).build()
            );

            mockMvc.perform(put("/v1/admin/courses/" + course.getId() + "/modules/reorder")
                            .cookie(adminCookie())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(reorderReq)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data", hasSize(2)))
                    .andExpect(jsonPath("$.data[0].id", is(mod2Id.intValue())))
                    .andExpect(jsonPath("$.data[0].sortOrder", is(1)))
                    .andExpect(jsonPath("$.data[1].id", is(mod1Id.intValue())))
                    .andExpect(jsonPath("$.data[1].sortOrder", is(2)));
        }

        @Test
        @DisplayName("F3 & F6: Lesson Authoring Suite and Lesson Materials Attachment")
        void testLessonAuthoringAndMaterials() throws Exception {
            Course course = courseRepository.save(Course.builder()
                    .title("Cloud Native Java")
                    .slug("cloud-native-java")
                    .active(true)
                    .build());

            CreateLessonRequest lessonReq = CreateLessonRequest.builder()
                    .title("Kubernetes Deployment Patterns")
                    .content("# Production Deployments\nDetails on probes and ingress.")
                    .youtubeUrl("https://youtube.com/watch?v=k8s12345")
                    .dayNumber(1)
                    .sortOrder(1)
                    .durationMinutes(45)
                    .lessonType(LessonType.VIDEO)
                    .isFreePreview(true)
                    .isPublished(true)
                    .build();

            String lessonRes = mockMvc.perform(post("/v1/admin/courses/" + course.getId() + "/lessons")
                            .cookie(adminCookie())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(lessonReq)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.data.title", is("Kubernetes Deployment Patterns")))
                    .andReturn().getResponse().getContentAsString();

            Long lessonId = objectMapper.readTree(lessonRes).path("data").path("id").asLong();

            // Attach Material
            CreateMaterialRequest matReq = CreateMaterialRequest.builder()
                    .title("Kubernetes Helm Chart Repo")
                    .materialType(MaterialType.REPO_LINK)
                    .url("https://github.com/mrdevcourses/k8s-charts")
                    .sortOrder(1)
                    .build();

            String matRes = mockMvc.perform(post("/v1/admin/lessons/" + lessonId + "/materials")
                            .cookie(adminCookie())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(matReq)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.data.title", is("Kubernetes Helm Chart Repo")))
                    .andReturn().getResponse().getContentAsString();

            Long matId = objectMapper.readTree(matRes).path("data").path("id").asLong();

            // Delete Material
            mockMvc.perform(delete("/v1/admin/materials/" + matId).cookie(adminCookie()))
                    .andExpect(status().isOk());

            assertThat(lessonMaterialRepository.findById(matId)).isEmpty();
        }

        @Test
        @DisplayName("F7: Quiz Builder and Question/Option Binding")
        void testQuizBuilderSetup() throws Exception {
            Course course = courseRepository.save(Course.builder().title("Security").slug("sec").active(true).build());
            Lesson lesson = lessonRepository.save(Lesson.builder().course(course).title("JWT Security").dayNumber(1).sortOrder(1).build());

            CreateQuizRequest quizReq = CreateQuizRequest.builder()
                    .title("JWT Validation Knowledge Check")
                    .description("Test your understanding of JWT claims and signatures")
                    .passingScorePercentage(80)
                    .maxAttempts(3)
                    .questions(List.of(
                            CreateQuizQuestionRequest.builder()
                                    .questionText("Which claim stores the expiration timestamp?")
                                    .questionType(QuestionType.SINGLE_CHOICE)
                                    .points(1)
                                    .sortOrder(1)
                                    .options(List.of(
                                            CreateQuizOptionRequest.builder().optionText("exp").isCorrect(true).sortOrder(1).build(),
                                            CreateQuizOptionRequest.builder().optionText("iat").isCorrect(false).sortOrder(2).build(),
                                            CreateQuizOptionRequest.builder().optionText("sub").isCorrect(false).sortOrder(3).build()
                                    ))
                                    .build()
                    ))
                    .build();

            mockMvc.perform(post("/v1/admin/lessons/" + lesson.getId() + "/quiz")
                            .cookie(adminCookie())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(quizReq)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.title", is("JWT Validation Knowledge Check")))
                    .andExpect(jsonPath("$.data.questions", hasSize(1)))
                    .andExpect(jsonPath("$.data.questions[0].options", hasSize(3)));

            // Fetch Quiz by Lesson
            mockMvc.perform(get("/v1/admin/lessons/" + lesson.getId() + "/quiz").cookie(adminCookie()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.passingScorePercentage", is(80)));
        }

        @Test
        @DisplayName("F8, F9, F10, F11, F12: Student Administration, Role Management, Progress & Cohorts")
        void testStudentAdminConsoleAndCohorts() throws Exception {
            Course course = courseRepository.save(Course.builder().title("Postgres Performance").slug("pg-perf").active(true).build());

            // Search Students
            mockMvc.perform(get("/v1/admin/students")
                            .param("q", "alex")
                            .cookie(adminCookie()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.content", hasSize(1)))
                    .andExpect(jsonPath("$.data.content[0].email", is("alex.student@gmail.com")));

            // Manual Enrollment
            mockMvc.perform(post("/v1/admin/students/" + studentUser.getId() + "/enroll/" + course.getId())
                            .cookie(adminCookie()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.courseId", is(course.getId().intValue())));

            // Student Progress Inspection
            mockMvc.perform(get("/v1/admin/students/" + studentUser.getId() + "/progress")
                            .cookie(adminCookie()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.email", is("alex.student@gmail.com")))
                    .andExpect(jsonPath("$.data.enrolledCourses", hasSize(1)));

            // Role Switch (Demote/Promote)
            StudentRoleUpdateRequest roleReq = StudentRoleUpdateRequest.builder().role(Role.ADMIN).build();
            mockMvc.perform(patch("/v1/admin/students/" + studentUser.getId() + "/role")
                            .cookie(adminCookie())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(roleReq)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.role", is("ADMIN")));

            // Cohort Creation
            CreateCohortRequest cohortReq = CreateCohortRequest.builder()
                    .name("Autumn 2026 Cohort")
                    .startDate(Instant.now().plus(7, ChronoUnit.DAYS))
                    .endDate(Instant.now().plus(60, ChronoUnit.DAYS))
                    .maxStudents(30)
                    .isActive(true)
                    .build();

            mockMvc.perform(post("/v1/admin/courses/" + course.getId() + "/cohorts")
                            .cookie(adminCookie())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(cohortReq)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.data.name", is("Autumn 2026 Cohort")));
        }

        @Test
        @DisplayName("F13-F16: Analytics Overview, Step-by-Step Funnel, Streaks, and Retention Matrix")
        void testTelemetryEndpoints() throws Exception {
            Course course = courseRepository.save(Course.builder().title("JVM Internals").slug("jvm-internals").active(true).build());
            Lesson l1 = lessonRepository.save(Lesson.builder().course(course).title("Day 1: Memory Model").dayNumber(1).sortOrder(1).build());
            Lesson l2 = lessonRepository.save(Lesson.builder().course(course).title("Day 2: GC Tuning").dayNumber(2).sortOrder(2).build());

            enrollmentRepository.save(Enrollment.builder().user(studentUser).course(course).enrolledAt(Instant.now().minus(2, ChronoUnit.DAYS)).build());
            lessonProgressRepository.save(LessonProgress.builder().user(studentUser).lesson(l1).completedAt(Instant.now().minus(1, ChronoUnit.DAYS)).build());

            // Overview KPI
            mockMvc.perform(get("/v1/admin/analytics/overview").cookie(adminCookie()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.totalStudents", is(1))) // only 1 student user
                    .andExpect(jsonPath("$.data.totalEnrollments", is(1)))
                    .andExpect(jsonPath("$.data.totalLessonsCompleted", is(1)));

            // Funnel
            mockMvc.perform(get("/v1/admin/analytics/courses/" + course.getId() + "/funnel").cookie(adminCookie()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data", hasSize(4))) // Enrolled -> Day 1 -> Day 2 -> Completed
                    .andExpect(jsonPath("$.data[0].stepName", is("Зачислено на курс")))
                    .andExpect(jsonPath("$.data[0].studentsCount", is(1)))
                    .andExpect(jsonPath("$.data[1].studentsCount", is(1)))
                    .andExpect(jsonPath("$.data[2].studentsCount", is(0)));

            // Streaks
            mockMvc.perform(get("/v1/admin/analytics/streaks").cookie(adminCookie()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data", hasSize(5)));

            // Retention
            mockMvc.perform(get("/v1/admin/analytics/courses/" + course.getId() + "/retention").cookie(adminCookie()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.totalEnrolled", is(1)))
                    .andExpect(jsonPath("$.data.lessonRetention", hasSize(2)));
        }

        @Test
        @DisplayName("F22: Outbox Metrics & Ingestion Trigger Telemetry")
        void testOutboxAndAutomation() throws Exception {
            Course course = courseRepository.save(Course.builder().title("AI RAG Systems").slug("ai-rag").active(true).build());

            // Metrics
            mockMvc.perform(get("/v1/admin/automation/outbox-metrics").cookie(adminCookie()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.pendingCount", is(0)));

            // Ingestion trigger
            mockMvc.perform(post("/v1/admin/automation/ingest/courses/" + course.getId()).cookie(adminCookie()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.courseId", is(course.getId().intValue())));

            // Verify Outbox Event created
            List<OutboxEvent> events = outboxEventRepository.findAll();
            assertThat(events).hasSize(1);
            assertThat(events.get(0).getEventType()).isEqualTo("COURSE_INGESTION_REQUESTED");
            assertThat(events.get(0).getStatus()).isEqualTo(OutboxStatus.PENDING);
        }
    }

    @Nested
    @DisplayName("Tier 2: Boundary & Corner Cases")
    class Tier2BoundaryCornerCasesTests {

        @Test
        @DisplayName("Self-Demotion Guard: Admin cannot demote themselves to STUDENT")
        void testSelfDemotionGuard() throws Exception {
            StudentRoleUpdateRequest demoteReq = StudentRoleUpdateRequest.builder().role(Role.STUDENT).build();

            mockMvc.perform(patch("/v1/admin/students/" + primaryAdmin.getId() + "/role")
                            .cookie(adminCookie())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(demoteReq)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Last-Admin Protection: Cannot demote sole remaining admin in the system")
        void testLastAdminProtection() throws Exception {
            // Delete secondary admin so primaryAdmin is the sole admin
            userRepository.delete(secondaryAdmin);

            StudentRoleUpdateRequest demoteReq = StudentRoleUpdateRequest.builder().role(Role.STUDENT).build();

            // Even if requested with another auth mechanism, cannot demote sole admin
            mockMvc.perform(patch("/v1/admin/students/" + primaryAdmin.getId() + "/role")
                            .cookie(adminCookie())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(demoteReq)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Duplicate Slug Conflict: Creating course with existing slug returns 409 Conflict")
        void testDuplicateCourseSlugConflict() throws Exception {
            courseRepository.save(Course.builder().title("Original").slug("conflict-slug").active(true).build());

            CreateCourseRequest duplicateReq = CreateCourseRequest.builder()
                    .title("Duplicate")
                    .slug("conflict-slug")
                    .build();

            mockMvc.perform(post("/v1/admin/courses")
                            .cookie(adminCookie())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(duplicateReq)))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.message", containsString("already exists")));
        }

        @Test
        @DisplayName("Duplicate Day Number: Creating lesson with existing dayNumber in same course returns 409 Conflict")
        void testDuplicateLessonDayNumberConflict() throws Exception {
            Course course = courseRepository.save(Course.builder().title("Test Course").slug("tc").active(true).build());
            lessonRepository.save(Lesson.builder().course(course).title("Day 1").dayNumber(1).sortOrder(1).build());

            CreateLessonRequest duplicateDayReq = CreateLessonRequest.builder()
                    .title("Another Day 1")
                    .dayNumber(1)
                    .build();

            mockMvc.perform(post("/v1/admin/courses/" + course.getId() + "/lessons")
                            .cookie(adminCookie())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(duplicateDayReq)))
                    .andExpect(status().isConflict());
        }

        @Test
        @DisplayName("Non-Admin RBAC Gate: Student token receives 403 Forbidden across admin suite")
        void testNonAdminForbiddenOnAllAdminEndpoints() throws Exception {
            mockMvc.perform(get("/v1/admin/courses").cookie(studentCookie()))
                    .andExpect(status().isForbidden());

            mockMvc.perform(get("/v1/admin/students").cookie(studentCookie()))
                    .andExpect(status().isForbidden());

            mockMvc.perform(get("/v1/admin/analytics/overview").cookie(studentCookie()))
                    .andExpect(status().isForbidden());

            mockMvc.perform(get("/v1/admin/automation/outbox-metrics").cookie(studentCookie()))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("Unauthenticated Gate: Missing cookie returns 401 Unauthorized")
        void testUnauthenticatedGate() throws Exception {
            mockMvc.perform(get("/v1/admin/courses"))
                    .andExpect(status().isUnauthorized());

            mockMvc.perform(get("/v1/admin/analytics/overview"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Empty Course Telemetry: Course with 0 enrollments returns safe 0% rates without div-by-zero")
        void testEmptyCourseTelemetryZeroSafety() throws Exception {
            Course emptyCourse = courseRepository.save(Course.builder().title("Empty Course").slug("empty-course").active(true).build());

            mockMvc.perform(get("/v1/admin/analytics/courses/" + emptyCourse.getId() + "/funnel").cookie(adminCookie()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data", hasSize(1)))
                    .andExpect(jsonPath("$.data[0].conversionRate", is(0.0)));

            mockMvc.perform(get("/v1/admin/analytics/courses/" + emptyCourse.getId() + "/retention").cookie(adminCookie()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.overallCompletionRate", is(0.0)))
                    .andExpect(jsonPath("$.data.lessonRetention", hasSize(0)));
        }

        @Test
        @DisplayName("404 on Missing Entity Queries")
        void testNotFoundHandling() throws Exception {
            mockMvc.perform(get("/v1/admin/courses/999999/modules").cookie(adminCookie()))
                    .andExpect(status().isNotFound());

            mockMvc.perform(delete("/v1/admin/courses/999999").cookie(adminCookie()))
                    .andExpect(status().isNotFound());

            mockMvc.perform(delete("/v1/admin/lessons/999999").cookie(adminCookie()))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("Tier 3: Cross-Feature State Transitions & Invariant Verification")
    class Tier3CrossFeatureTests {

        @Test
        @DisplayName("Admin Course & Lesson Operations Log Immutable Audit Entries")
        void testAdminAuditLogGeneration() throws Exception {
            CreateCourseRequest createCourseReq = CreateCourseRequest.builder()
                    .title("Audit Tested Course")
                    .slug("audit-course")
                    .active(true)
                    .build();

            String courseRes = mockMvc.perform(post("/v1/admin/courses")
                            .cookie(adminCookie())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(createCourseReq)))
                    .andExpect(status().isCreated())
                    .andReturn().getResponse().getContentAsString();

            Long courseId = objectMapper.readTree(courseRes).path("data").path("id").asLong();

            // Verify Audit Log entry created for course creation
            List<AuditLog> courseLogs = auditLogRepository.findByActionOrderByCreatedAtDesc("ADMIN_CREATE_COURSE");
            assertThat(courseLogs).isNotEmpty();
            assertThat(courseLogs.get(0).getEntityId()).isEqualTo(courseId);
            assertThat(courseLogs.get(0).getUser().getId()).isEqualTo(primaryAdmin.getId());

            // Add lesson
            CreateLessonRequest createLessonReq = CreateLessonRequest.builder()
                    .title("Audit Lesson 1")
                    .dayNumber(1)
                    .sortOrder(1)
                    .build();

            String lessonRes = mockMvc.perform(post("/v1/admin/courses/" + courseId + "/lessons")
                            .cookie(adminCookie())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(createLessonReq)))
                    .andExpect(status().isCreated())
                    .andReturn().getResponse().getContentAsString();

            Long lessonId = objectMapper.readTree(lessonRes).path("data").path("id").asLong();

            // Verify Audit Log entry for lesson creation
            List<AuditLog> lessonLogs = auditLogRepository.findByActionOrderByCreatedAtDesc("ADMIN_CREATE_LESSON");
            assertThat(lessonLogs).isNotEmpty();
            assertThat(lessonLogs.get(0).getEntityId()).isEqualTo(lessonId);
        }

        @Test
        @DisplayName("Manual Enrollment State Sync: Immediately updates Platform KPI and Funnel Step 0")
        void testManualEnrollmentReflectsInTelemetry() throws Exception {
            Course course = courseRepository.save(Course.builder().title("Realtime Sync Course").slug("rt-sync").active(true).build());

            // Initial KPI
            mockMvc.perform(get("/v1/admin/analytics/overview").cookie(adminCookie()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.totalEnrollments", is(0)));

            // Manual enroll
            mockMvc.perform(post("/v1/admin/students/" + studentUser.getId() + "/enroll/" + course.getId())
                            .cookie(adminCookie()))
                    .andExpect(status().isOk());

            // Updated KPI
            mockMvc.perform(get("/v1/admin/analytics/overview").cookie(adminCookie()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.totalEnrollments", is(1)));

            // Updated Funnel
            mockMvc.perform(get("/v1/admin/analytics/courses/" + course.getId() + "/funnel").cookie(adminCookie()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data[0].studentsCount", is(1)))
                    .andExpect(jsonPath("$.data[0].conversionRate", is(100.0)));
        }

        @Test
        @DisplayName("Student Lesson Progress Dynamically Propagates to Funnel and Retention")
        void testStudentProgressPropagatesToFunnelAndRetention() throws Exception {
            Course course = courseRepository.save(Course.builder().title("Full Progression Course").slug("prog-course").active(true).build());
            Lesson l1 = lessonRepository.save(Lesson.builder().course(course).title("L1").dayNumber(1).sortOrder(1).build());
            Lesson l2 = lessonRepository.save(Lesson.builder().course(course).title("L2").dayNumber(2).sortOrder(2).build());

            enrollmentRepository.save(Enrollment.builder().user(studentUser).course(course).enrolledAt(Instant.now()).build());

            // Before any lesson completed
            mockMvc.perform(get("/v1/admin/analytics/courses/" + course.getId() + "/funnel").cookie(adminCookie()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data[1].studentsCount", is(0))) // L1 completed
                    .andExpect(jsonPath("$.data[3].studentsCount", is(0))); // 100% completed

            // Complete L1
            lessonProgressRepository.save(LessonProgress.builder().user(studentUser).lesson(l1).completedAt(Instant.now()).build());

            mockMvc.perform(get("/v1/admin/analytics/courses/" + course.getId() + "/funnel").cookie(adminCookie()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data[1].studentsCount", is(1)))
                    .andExpect(jsonPath("$.data[1].conversionRate", is(100.0)))
                    .andExpect(jsonPath("$.data[3].studentsCount", is(0)));

            // Complete L2 -> 100% Completion
            lessonProgressRepository.save(LessonProgress.builder().user(studentUser).lesson(l2).completedAt(Instant.now()).build());

            mockMvc.perform(get("/v1/admin/analytics/courses/" + course.getId() + "/funnel").cookie(adminCookie()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data[2].studentsCount", is(1)))
                    .andExpect(jsonPath("$.data[3].studentsCount", is(1)))
                    .andExpect(jsonPath("$.data[3].conversionRate", is(100.0)));

            // Overview KPI completions check
            mockMvc.perform(get("/v1/admin/analytics/overview").cookie(adminCookie()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.totalCompletions", is(1)))
                    .andExpect(jsonPath("$.data.completionRate", is(100.0)));
        }
    }

    @Nested
    @DisplayName("Tier 4: Real-World Administrative Workflows")
    class Tier4RealWorldWorkflowsTests {

        @Test
        @DisplayName("Workflow 1: Full Course Curriculum Authoring, Material/Quiz Setup & Publishing Lifecycle")
        void testWorkflow1_FullCurriculumAuthoringLifecycle() throws Exception {
            // Step 1: Admin creates draft course
            CreateCourseRequest courseReq = CreateCourseRequest.builder()
                    .title("Cloud Architecture Masterclass")
                    .slug("cloud-arch-masterclass")
                    .description("Enterprise grade microservices on AWS/K8s")
                    .active(false)
                    .build();

            String courseRes = mockMvc.perform(post("/v1/admin/courses")
                            .cookie(adminCookie())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(courseReq)))
                    .andExpect(status().isCreated())
                    .andReturn().getResponse().getContentAsString();

            Long courseId = objectMapper.readTree(courseRes).path("data").path("id").asLong();

            // Step 2: Admin creates Module 1 and Module 2
            CreateModuleRequest m1Req = CreateModuleRequest.builder().title("Part 1: VPC & Networking").sortOrder(1).isFreePreview(true).build();
            String m1Res = mockMvc.perform(post("/v1/admin/courses/" + courseId + "/modules")
                            .cookie(adminCookie())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(m1Req)))
                    .andExpect(status().isCreated())
                    .andReturn().getResponse().getContentAsString();
            Long m1Id = objectMapper.readTree(m1Res).path("data").path("id").asLong();

            CreateModuleRequest m2Req = CreateModuleRequest.builder().title("Part 2: EKS & Service Mesh").sortOrder(2).isFreePreview(false).build();
            mockMvc.perform(post("/v1/admin/courses/" + courseId + "/modules")
                            .cookie(adminCookie())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(m2Req)))
                    .andExpect(status().isCreated());

            // Step 3: Admin adds Lesson to Module 1
            CreateLessonRequest l1Req = CreateLessonRequest.builder()
                    .title("VPC Peering vs Transit Gateway")
                    .content("Comparative analysis of network topographies.")
                    .youtubeUrl("https://youtube.com/watch?v=vpc123")
                    .dayNumber(1)
                    .sortOrder(1)
                    .durationMinutes(30)
                    .moduleId(m1Id)
                    .lessonType(LessonType.VIDEO)
                    .isFreePreview(true)
                    .build();

            String l1Res = mockMvc.perform(post("/v1/admin/courses/" + courseId + "/lessons")
                            .cookie(adminCookie())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(l1Req)))
                    .andExpect(status().isCreated())
                    .andReturn().getResponse().getContentAsString();
            Long l1Id = objectMapper.readTree(l1Res).path("data").path("id").asLong();

            // Step 4: Admin attaches Terraform Cheat Sheet to Lesson 1
            CreateMaterialRequest matReq = CreateMaterialRequest.builder()
                    .title("Terraform VPC Module Blueprint")
                    .materialType(MaterialType.CHEAT_SHEET)
                    .url("https://mrdevcourses.com/materials/vpc-tf.pdf")
                    .sortOrder(1)
                    .build();

            mockMvc.perform(post("/v1/admin/lessons/" + l1Id + "/materials")
                            .cookie(adminCookie())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(matReq)))
                    .andExpect(status().isCreated());

            // Step 5: Admin binds Quiz to Lesson 1
            CreateQuizRequest quizReq = CreateQuizRequest.builder()
                    .title("VPC Architecture Quiz")
                    .passingScorePercentage(80)
                    .questions(List.of(
                            CreateQuizQuestionRequest.builder()
                                    .questionText("Which component enables transit routing across 100+ VPCs?")
                                    .points(1)
                                    .options(List.of(
                                            CreateQuizOptionRequest.builder().optionText("AWS Transit Gateway").isCorrect(true).sortOrder(1).build(),
                                            CreateQuizOptionRequest.builder().optionText("VPC Peering mesh").isCorrect(false).sortOrder(2).build()
                                    ))
                                    .build()
                    ))
                    .build();

            mockMvc.perform(post("/v1/admin/lessons/" + l1Id + "/quiz")
                            .cookie(adminCookie())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(quizReq)))
                    .andExpect(status().isOk());

            // Step 6: Admin publishes Course
            UpdateCourseRequest pubReq = UpdateCourseRequest.builder()
                    .title("Cloud Architecture Masterclass")
                    .slug("cloud-arch-masterclass")
                    .description("Enterprise grade microservices on AWS/K8s")
                    .active(true)
                    .build();

            mockMvc.perform(put("/v1/admin/courses/" + courseId)
                            .cookie(adminCookie())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(pubReq)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.active", is(true)));

            // Step 7: Public API verification - Students can now view the published course
            mockMvc.perform(get("/v1/courses/cloud-arch-masterclass"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.title", is("Cloud Architecture Masterclass")))
                    .andExpect(jsonPath("$.data.modules", hasSize(2)))
                    .andExpect(jsonPath("$.data.modules[0].lessons", hasSize(1)));
        }

        @Test
        @DisplayName("Workflow 2: Student Triage, RBAC Delegation, Cohort Enrollment & Progress Auditing")
        void testWorkflow2_StudentSupportAndTriageJourney() throws Exception {
            Course course = courseRepository.save(Course.builder().title("DevOps Mastery").slug("devops-mastery").active(true).build());
            Lesson lesson = lessonRepository.save(Lesson.builder().course(course).title("CI/CD Pipeline").dayNumber(1).sortOrder(1).build());

            // Step 1: Admin searches student in console
            mockMvc.perform(get("/v1/admin/students").param("q", "alex").cookie(adminCookie()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.content[0].email", is("alex.student@gmail.com")));

            // Step 2: Admin manually enrolls student into course
            mockMvc.perform(post("/v1/admin/students/" + studentUser.getId() + "/enroll/" + course.getId()).cookie(adminCookie()))
                    .andExpect(status().isOk());

            // Step 3: Admin promotes student to Assistant Admin
            StudentRoleUpdateRequest roleReq = StudentRoleUpdateRequest.builder().role(Role.ADMIN).build();
            mockMvc.perform(patch("/v1/admin/students/" + studentUser.getId() + "/role")
                            .cookie(adminCookie())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(roleReq)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.role", is("ADMIN")));

            // Step 4: Newly promoted admin can now inspect admin courses
            String newlyPromotedAdminToken = jwtTokenProvider.generateToken(userRepository.findById(studentUser.getId()).get());
            mockMvc.perform(get("/v1/admin/courses").cookie(new Cookie("MrDev_token", newlyPromotedAdminToken)))
                    .andExpect(status().isOk());

            // Step 5: Verify complete audit trail of actions
            List<AuditLog> auditEntries = auditLogRepository.findAll();
            assertThat(auditEntries).isNotEmpty();
        }

        @Test
        @DisplayName("Workflow 3: Platform Telemetry Health, AI Ingestion & Outbox Monitoring Flow")
        void testWorkflow3_PlatformHealthAndOutboxTelemetry() throws Exception {
            Course course = courseRepository.save(Course.builder().title("LLM Architecture").slug("llm-arch").active(true).build());

            // Step 1: Query initial outbox metrics
            mockMvc.perform(get("/v1/admin/automation/outbox-metrics").cookie(adminCookie()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.pendingCount", is(0)));

            // Step 2: Trigger Course Ingestion into Outbox
            mockMvc.perform(post("/v1/admin/automation/ingest/courses/" + course.getId()).cookie(adminCookie()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.courseId", is(course.getId().intValue())));

            // Step 3: Verify Outbox reflects 1 pending event
            mockMvc.perform(get("/v1/admin/automation/outbox-metrics").cookie(adminCookie()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.pendingCount", is(1)));

            // Step 4: Query student retention risks
            mockMvc.perform(get("/v1/admin/automation/retention-risks").cookie(adminCookie()))
                    .andExpect(status().isOk());
        }
    }
}
