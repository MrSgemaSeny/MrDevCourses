package com.mrdev.modules.student.e2e;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mrdev.modules.audit.repository.AuditLogRepository;
import com.mrdev.modules.auth.dto.RegisterRequest;
import com.mrdev.modules.auth.model.Role;
import com.mrdev.modules.auth.model.User;
import com.mrdev.modules.auth.repository.UserRepository;
import com.mrdev.modules.auth.service.JwtTokenProvider;
import com.mrdev.modules.certificate.model.Certificate;
import com.mrdev.modules.certificate.repository.CertificateRepository;
import com.mrdev.modules.course.model.Course;
import com.mrdev.modules.course.model.CourseModule;
import com.mrdev.modules.course.model.Enrollment;
import com.mrdev.modules.course.repository.CohortRepository;
import com.mrdev.modules.course.repository.CourseModuleRepository;
import com.mrdev.modules.course.repository.CourseRepository;
import com.mrdev.modules.course.repository.EnrollmentRepository;
import com.mrdev.modules.help.dto.CreateHelpRequest;
import com.mrdev.modules.help.model.StudentHelpRequest;
import com.mrdev.modules.help.repository.StudentHelpRequestRepository;
import com.mrdev.modules.homework.dto.AdminReviewHomeworkRequest;
import com.mrdev.modules.homework.dto.HomeworkSubmitRequest;
import com.mrdev.modules.homework.model.HomeworkSubmission;
import com.mrdev.modules.homework.model.SubmissionStatus;
import com.mrdev.modules.homework.repository.HomeworkSubmissionRepository;
import com.mrdev.modules.lesson.model.Lesson;
import com.mrdev.modules.lesson.model.LessonProgress;
import com.mrdev.modules.lesson.model.LessonType;
import com.mrdev.modules.lesson.repository.LessonProgressRepository;
import com.mrdev.modules.lesson.repository.LessonRepository;
import com.mrdev.modules.quiz.dto.QuizSubmitRequest;
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class StudentSuiteE2ETest {

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
    private LessonProgressRepository lessonProgressRepository;

    @Autowired
    private HomeworkSubmissionRepository homeworkSubmissionRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuizQuestionRepository quizQuestionRepository;

    @Autowired
    private QuizQuestionOptionRepository quizQuestionOptionRepository;

    @Autowired
    private QuizSubmissionRepository quizSubmissionRepository;

    @Autowired
    private StudentHelpRequestRepository studentHelpRequestRepository;

    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder =
            new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();

    private User mentorAdmin;
    private User student;
    private String adminToken;
    private String studentToken;
    private Course course;
    private CourseModule module1;
    private Lesson day1Lesson;
    private Lesson day2Lesson;
    private Lesson day3QuizLesson;
    private Quiz quiz;
    private QuizQuestion question1;
    private QuizQuestionOption option1Correct;
    private QuizQuestionOption option2Wrong;

    @BeforeEach
    void setUp() {
        // Clean all test tables in reverse foreign key order
        studentHelpRequestRepository.deleteAll();
        certificateRepository.deleteAll();
        quizSubmissionRepository.deleteAll();
        quizQuestionOptionRepository.deleteAll();
        quizQuestionRepository.deleteAll();
        quizRepository.deleteAll();
        homeworkSubmissionRepository.deleteAll();
        lessonProgressRepository.deleteAll();
        lessonRepository.deleteAll();
        courseModuleRepository.deleteAll();
        enrollmentRepository.deleteAll();
        cohortRepository.deleteAll();
        courseRepository.deleteAll();
        auditLogRepository.deleteAll();
        userRepository.deleteAll();

        // 1. Create mentor admin user
        mentorAdmin = userRepository.save(User.builder()
                .email("mentor@mrdev.com")
                .name("Senior Mentor")
                .passwordHash(passwordEncoder.encode("SecurePass123!"))
                .role(Role.ADMIN)
                .lastActiveDate(LocalDate.now())
                .build());
        adminToken = jwtTokenProvider.generateToken(mentorAdmin);

        // 2. Create student user
        student = userRepository.save(User.builder()
                .email("student@test.com")
                .name("Alex Student")
                .passwordHash(passwordEncoder.encode("StudentPass123!"))
                .role(Role.STUDENT)
                .lastActiveDate(LocalDate.now())
                .build());
        studentToken = jwtTokenProvider.generateToken(student);

        // 3. Create active course
        course = courseRepository.save(Course.builder()
                .title("Full-Stack Architecture & Spring Boot")
                .slug("full-stack-spring-boot")
                .description("Professional engineering bootcamp from scratch to production.")
                .active(true)
                .build());

        // 4. Create module
        module1 = courseModuleRepository.save(CourseModule.builder()
                .course(course)
                .title("Module 1: Foundations & Architecture")
                .description("Core web standards and clean architecture")
                .sortOrder(1)
                .isFreePreview(false)
                .build());

        // 5. Create lessons (Day 1, Day 2, Day 3 Quiz)
        day1Lesson = lessonRepository.save(Lesson.builder()
                .course(course)
                .module(module1)
                .title("Day 1: Clean Architecture & REST")
                .dayNumber(1)
                .lessonType(LessonType.VIDEO)
                .content("# Day 1 Content\nDetailed architectural overview.")
                .youtubeUrl("https://youtube.com/watch?v=mock-day-1")
                .durationMinutes(45)
                .isFreePreview(false)
                .isPublished(true)
                .build());

        day2Lesson = lessonRepository.save(Lesson.builder()
                .course(course)
                .module(module1)
                .title("Day 2: Database Design & Flyway")
                .dayNumber(2)
                .lessonType(LessonType.PRACTICE)
                .content("# Day 2 Practice\nImplement schema and migrations.")
                .durationMinutes(60)
                .isFreePreview(false)
                .isPublished(true)
                .build());

        day3QuizLesson = lessonRepository.save(Lesson.builder()
                .course(course)
                .module(module1)
                .title("Day 3: Assessment Quiz")
                .dayNumber(3)
                .lessonType(LessonType.QUIZ)
                .content("# Day 3 Knowledge Check")
                .durationMinutes(20)
                .isFreePreview(false)
                .isPublished(true)
                .build());

        // 6. Create Quiz & Options
        quiz = quizRepository.save(Quiz.builder()
                .lesson(day3QuizLesson)
                .title("Module 1 Assessment")
                .passingScorePercentage(80)
                .build());

        question1 = quizQuestionRepository.save(QuizQuestion.builder()
                .quiz(quiz)
                .questionText("Which Flyway prefix represents a versioned migration?")
                .questionType(QuestionType.SINGLE_CHOICE)
                .sortOrder(1)
                .points(10)
                .explanation("V represents standard versioned migrations executed in strict order.")
                .build());

        option1Correct = quizQuestionOptionRepository.save(QuizQuestionOption.builder()
                .question(question1)
                .optionText("V{N}__")
                .isCorrect(true)
                .sortOrder(1)
                .build());

        option2Wrong = quizQuestionOptionRepository.save(QuizQuestionOption.builder()
                .question(question1)
                .optionText("U{N}__")
                .isCorrect(false)
                .sortOrder(2)
                .build());
    }

    @Nested
    @DisplayName("Tier 1: Onboarding, Catalog & Enrollment Flow")
    class Tier1OnboardingAndEnrollmentTests {

        @Test
        @DisplayName("Student registration and public course catalog discovery")
        void testStudentRegistrationAndCatalogDiscovery() throws Exception {
            // 1. Register new student
            RegisterRequest registerRequest = new RegisterRequest();
            registerRequest.setEmail("newcadet@mrdev.com");
            registerRequest.setName("New Cadet");
            registerRequest.setPassword("CadetPass2026!");

            MvcResult regResult = mockMvc.perform(post("/v1/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(registerRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data.email", is("newcadet@mrdev.com")))
                    .andReturn();

            assertThat(regResult.getResponse().getCookie("MrDev_token")).isNotNull();

            // 2. Discover courses publicly
            mockMvc.perform(get("/v1/courses"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))))
                    .andExpect(jsonPath("$.data[0].slug", is("full-stack-spring-boot")));

            // 3. View course syllabus
            mockMvc.perform(get("/v1/courses/" + course.getSlug()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data.title", is("Full-Stack Architecture & Spring Boot")));
        }

        @Test
        @DisplayName("Student enrolls in course and receives active enrollment record")
        void testStudentEnrollment() throws Exception {
            mockMvc.perform(post("/v1/courses/" + course.getId() + "/enroll")
                            .cookie(new Cookie("MrDev_token", studentToken)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data.courseId", is(course.getId().intValue())));

            assertThat(enrollmentRepository.existsByUserIdAndCourseId(student.getId(), course.getId())).isTrue();
        }
    }

    @Nested
    @DisplayName("Tier 2: Real-time Drip Engine & Lesson Progression")
    class Tier2DripEngineAndProgressTests {

        @Test
        @DisplayName("Enrolled student accesses Day 1 lesson but is locked from future lessons")
        void testDripGatingEnforcement() throws Exception {
            // Enroll student today
            enrollmentRepository.save(Enrollment.builder()
                    .user(student)
                    .course(course)
                    .enrolledAt(Instant.now())
                    .build());

            // 1. Day 1 is unlocked immediately
            mockMvc.perform(get("/v1/courses/" + course.getId() + "/lessons/" + day1Lesson.getId())
                            .cookie(new Cookie("MrDev_token", studentToken)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data.id", is(day1Lesson.getId().intValue())));

            // 2. Day 2 is locked (enrolled today, day 2 requires 1 day interval)
            mockMvc.perform(get("/v1/courses/" + course.getId() + "/lessons/" + day2Lesson.getId())
                            .cookie(new Cookie("MrDev_token", studentToken)))
                    .andExpect(status().isForbidden());

            // 3. Mark Day 1 complete
            mockMvc.perform(post("/v1/courses/" + course.getId() + "/lessons/" + day1Lesson.getId() + "/complete")
                            .cookie(new Cookie("MrDev_token", studentToken)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)));

            LessonProgress progress = lessonProgressRepository.findByUserIdAndLessonId(student.getId(), day1Lesson.getId()).orElse(null);
            assertThat(progress).isNotNull();
        }
    }

    @Nested
    @DisplayName("Tier 3: Homework Submission Lifecycle & Mentor Review Loop")
    class Tier3HomeworkSubmissionAndMentorReviewTests {

        @Test
        @DisplayName("Student submits homework -> Mentor reviews & approves -> Progress updated")
        void testHomeworkSubmissionAndApprovalWorkflow() throws Exception {
            // Setup enrollment
            enrollmentRepository.save(Enrollment.builder()
                    .user(student)
                    .course(course)
                    .enrolledAt(Instant.now().minus(2, ChronoUnit.DAYS))
                    .build());

            // 1. Student submits homework
            HomeworkSubmitRequest submitReq = HomeworkSubmitRequest.builder()
                    .codeSnippet("Implemented Flyway V1 and PostgreSQL indexes.")
                    .repositoryUrl("https://github.com/alexstudent/dev-homework-02")
                    .liveDemoUrl("https://dev-hw02.fly.dev")
                    .build();

            mockMvc.perform(post("/v1/courses/" + course.getId() + "/lessons/" + day2Lesson.getId() + "/homework/submit")
                            .cookie(new Cookie("MrDev_token", studentToken))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(submitReq)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data.status", is("PENDING")));

            List<HomeworkSubmission> subs = homeworkSubmissionRepository.findAll();
            assertThat(subs).isNotEmpty();
            HomeworkSubmission sub = subs.get(0);
            assertThat(sub.getStatus()).isEqualTo(SubmissionStatus.PENDING);

            // 2. Mentor queries pending submissions
            mockMvc.perform(get("/v1/admin/homeworks")
                            .cookie(new Cookie("MrDev_token", adminToken)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));

            // 3. Mentor reviews and approves homework
            AdminReviewHomeworkRequest reviewReq = AdminReviewHomeworkRequest.builder()
                    .status(SubmissionStatus.PASSED)
                    .mentorFeedback("Clean Flyway scripts and excellent architecture. Approved!")
                    .build();

            mockMvc.perform(post("/v1/admin/homeworks/" + sub.getId() + "/review")
                            .cookie(new Cookie("MrDev_token", adminToken))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(reviewReq)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data.status", is("PASSED")));

            // 4. Verify student progress auto-completed upon homework approval
            LessonProgress progress = lessonProgressRepository.findByUserIdAndLessonId(student.getId(), day2Lesson.getId()).orElse(null);
            assertThat(progress).isNotNull();
        }
    }

    @Nested
    @DisplayName("Tier 4: Anti-Cheat Quiz Engine & Student SOS Help Ticket")
    class Tier4QuizAndHelpTicketTests {

        @Test
        @DisplayName("Anti-cheat masks correct answers from student DTO and calculates score server-side")
        void testAntiCheatQuizSubmission() throws Exception {
            // Enroll student
            enrollmentRepository.save(Enrollment.builder()
                    .user(student)
                    .course(course)
                    .enrolledAt(Instant.now().minus(4, ChronoUnit.DAYS))
                    .build());

            // 1. Student requests quiz -> verify isCorrect is omitted/hidden
            mockMvc.perform(get("/v1/lessons/" + day3QuizLesson.getId() + "/quiz")
                            .cookie(new Cookie("MrDev_token", studentToken)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data.questions[0].options[0].isCorrect").doesNotExist());

            // 2. Student submits correct option
            QuizSubmitRequest submitQuizReq = QuizSubmitRequest.builder()
                    .quizId(quiz.getId())
                    .selectedOptionIds(Map.of(question1.getId(), List.of(option1Correct.getId())))
                    .build();

            mockMvc.perform(post("/v1/lessons/" + day3QuizLesson.getId() + "/quiz/submit")
                            .cookie(new Cookie("MrDev_token", studentToken))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(submitQuizReq)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data.passed", is(true)))
                    .andExpect(jsonPath("$.data.scorePercentage", is(100)));
        }

        @Test
        @DisplayName("Student submits SOS help ticket persisting into database")
        void testStudentHelpTicketSubmission() throws Exception {
            // Enroll student
            enrollmentRepository.save(Enrollment.builder()
                    .user(student)
                    .course(course)
                    .enrolledAt(Instant.now())
                    .build());

            CreateHelpRequest helpReq = CreateHelpRequest.builder()
                    .stepIdentifier("step-2")
                    .stepTitle("Docker Setup")
                    .problemText("Docker container fails to bind to port 5432 on Windows.")
                    .errorLogs("Error response from daemon: driver failed programming external connectivity")
                    .build();

            mockMvc.perform(post("/v1/courses/" + course.getId() + "/lessons/" + day1Lesson.getId() + "/help-requests")
                            .cookie(new Cookie("MrDev_token", studentToken))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(helpReq)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data.status", is("OPEN")));

            List<StudentHelpRequest> tickets = studentHelpRequestRepository.findAll();
            assertThat(tickets).hasSize(1);
            assertThat(tickets.get(0).getProblemText()).contains("Docker container fails");
        }
    }

    @Nested
    @DisplayName("Tier 5: Graduation, PDF Certificate & Public Verification")
    class Tier5GraduationAndCertificateTests {

        @Test
        @DisplayName("Graduation certificate is verifiable publicly without auth")
        void testCertificatePublicVerification() throws Exception {
            // Seed verified certificate
            String certCode = UUID.randomUUID().toString();
            certificateRepository.save(Certificate.builder()
                    .user(student)
                    .course(course)
                    .certificateCode(certCode)
                    .build());

            // Verify certificate publicly
            mockMvc.perform(get("/v1/certificates/verify/" + certCode))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data.userName", is("Alex Student")))
                    .andExpect(jsonPath("$.data.courseTitle", is("Full-Stack Architecture & Spring Boot")));
        }
    }
}
