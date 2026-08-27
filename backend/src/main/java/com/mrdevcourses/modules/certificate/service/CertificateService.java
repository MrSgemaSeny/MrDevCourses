package com.mrdevcourses.modules.certificate.service;

import com.mrdevcourses.common.exception.ApiException;
import com.mrdevcourses.common.exception.ResourceNotFoundException;
import com.mrdevcourses.modules.audit.service.AuditService;
import com.mrdevcourses.modules.auth.model.User;
import com.mrdevcourses.modules.auth.repository.UserRepository;
import com.mrdevcourses.modules.certificate.dto.CertificateDto;
import com.mrdevcourses.modules.certificate.model.Certificate;
import com.mrdevcourses.modules.certificate.repository.CertificateRepository;
import com.mrdevcourses.modules.course.model.Course;
import com.mrdevcourses.modules.course.repository.CourseRepository;
import com.mrdevcourses.modules.course.repository.EnrollmentRepository;
import com.mrdevcourses.modules.lesson.repository.LessonProgressRepository;
import com.mrdevcourses.modules.lesson.repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CertificateService {

    private final CertificateRepository certificateRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final CertificatePdfGenerator pdfGenerator;
    private final AuditService auditService;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Transactional
    public CertificateDto issueCertificateIfEligible(Long userId, Long courseId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));

        if (!enrollmentRepository.existsByUserIdAndCourseId(userId, courseId)) {
            throw new ApiException("Вы не записаны на данный курс", HttpStatus.FORBIDDEN);
        }

        // Check if certificate already exists
        Optional<Certificate> existingCert = certificateRepository.findByUserIdAndCourseId(userId, courseId);
        if (existingCert.isPresent()) {
            return CertificateDto.fromEntity(existingCert.get(), frontendUrl);
        }

        // Verify all lessons are completed
        long totalLessons = lessonRepository.countByCourseId(courseId);
        long completedLessons = lessonProgressRepository.countCompletedLessonsByUserIdAndCourseId(userId, courseId);

        if (totalLessons == 0 || completedLessons < totalLessons) {
            throw new ApiException("Курс еще не завершен (пройдено " + completedLessons + " из " + totalLessons + " уроков)", HttpStatus.BAD_REQUEST);
        }

        String certificateCode = "MRDEV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase() + "-" + courseId;

        Certificate certificate = Certificate.builder()
                .certificateCode(certificateCode)
                .user(user)
                .course(course)
                .build();

        certificate = certificateRepository.save(certificate);
        log.info("[CertificateService] Issued certificate {} for user {} on course {}", certificateCode, userId, courseId);

        auditService.logAction(userId, "CERTIFICATE_ISSUED", "Certificate", certificate.getId(),
                "Certificate " + certificateCode + " issued for course: " + course.getTitle(), null);

        return CertificateDto.fromEntity(certificate, frontendUrl);
    }

    @Transactional(readOnly = true)
    public CertificateDto getCertificate(Long userId, Long courseId) {
        Certificate certificate = certificateRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate", "courseId", courseId));
        return CertificateDto.fromEntity(certificate, frontendUrl);
    }

    @Transactional(readOnly = true)
    public CertificateDto verifyCertificate(String certificateCode) {
        Certificate certificate = certificateRepository.findByCertificateCode(certificateCode)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate", "code", certificateCode));
        return CertificateDto.fromEntity(certificate, frontendUrl);
    }

    @Transactional(readOnly = true)
    public byte[] generatePdfForCertificate(String certificateCode) {
        Certificate certificate = certificateRepository.findByCertificateCode(certificateCode)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate", "code", certificateCode));

        String studentName = certificate.getUser().getName() != null && !certificate.getUser().getName().isBlank()
                ? certificate.getUser().getName()
                : certificate.getUser().getEmail();

        String issuedDate = DateTimeFormatter.ofPattern("dd.MM.yyyy")
                .withZone(ZoneOffset.UTC)
                .format(certificate.getIssuedAt());

        String verifyUrl = frontendUrl + "/certificates/verify/" + certificate.getCertificateCode();

        Map<String, Object> variables = Map.of(
                "userName", studentName,
                "courseTitle", certificate.getCourse().getTitle(),
                "issuedDate", issuedDate,
                "certificateCode", certificate.getCertificateCode(),
                "verifyUrl", verifyUrl
        );

        return pdfGenerator.generatePdf("certificate", variables);
    }
}
