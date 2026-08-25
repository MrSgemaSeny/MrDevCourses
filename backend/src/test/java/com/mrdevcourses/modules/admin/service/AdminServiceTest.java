package com.mrdevcourses.modules.admin.service;

import com.mrdevcourses.common.exception.ApiException;
import com.mrdevcourses.modules.admin.dto.StudentDto;
import com.mrdevcourses.modules.audit.service.AuditService;
import com.mrdevcourses.modules.auth.model.Role;
import com.mrdevcourses.modules.auth.model.User;
import com.mrdevcourses.modules.auth.repository.UserRepository;
import com.mrdevcourses.modules.course.dto.CourseDto;
import com.mrdevcourses.modules.course.dto.CreateCourseRequest;
import com.mrdevcourses.modules.course.model.Course;
import com.mrdevcourses.modules.course.repository.CourseRepository;
import com.mrdevcourses.modules.course.repository.EnrollmentRepository;
import com.mrdevcourses.modules.lesson.repository.LessonRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private LessonRepository lessonRepository;

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private AdminService adminService;

    private Course course;
    private User student;

    @BeforeEach
    void setUp() {
        course = Course.builder().id(1L).title("Admin Course").slug("admin-course").active(true).createdAt(Instant.now()).build();
        student = User.builder().id(20L).email("student2@test.com").name("Student Two").role(Role.STUDENT).createdAt(Instant.now()).build();
    }

    @Test
    void createCourse_WhenSlugUnique_ShouldSave() {
        CreateCourseRequest request = CreateCourseRequest.builder()
                .title("New Admin Course")
                .slug("new-admin-course")
                .description("Desc")
                .active(true)
                .build();

        when(courseRepository.existsBySlug("new-admin-course")).thenReturn(false);
        when(courseRepository.save(any(Course.class))).thenReturn(course);
        when(lessonRepository.countByCourseId(1L)).thenReturn(0L);

        CourseDto result = adminService.createCourse(request);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    void createCourse_WhenSlugExists_ShouldThrowConflict() {
        CreateCourseRequest request = CreateCourseRequest.builder()
                .title("New Admin Course")
                .slug("admin-course")
                .build();

        when(courseRepository.existsBySlug("admin-course")).thenReturn(true);

        assertThatThrownBy(() -> adminService.createCourse(request))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    void getAllStudents_ShouldReturnStudentListWithEnrollments() {
        when(userRepository.findAll()).thenReturn(List.of(student));
        when(enrollmentRepository.findAllByUserId(20L)).thenReturn(List.of());

        List<StudentDto> students = adminService.getAllStudents();

        assertThat(students).hasSize(1);
        assertThat(students.get(0).getEmail()).isEqualTo("student2@test.com");
    }
}
