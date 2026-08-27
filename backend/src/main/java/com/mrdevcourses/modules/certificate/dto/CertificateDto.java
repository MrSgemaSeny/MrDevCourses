package com.mrdevcourses.modules.certificate.dto;

import com.mrdevcourses.modules.certificate.model.Certificate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CertificateDto {
    private Long id;
    private String certificateCode;
    private Long userId;
    private String userName;
    private String userEmail;
    private Long courseId;
    private String courseTitle;
    private String courseSlug;
    private Instant issuedAt;
    private String verificationUrl;

    public static CertificateDto fromEntity(Certificate certificate, String frontendUrl) {
        String baseUrl = (frontendUrl != null && !frontendUrl.isBlank()) ? frontendUrl : "http://localhost:5173";
        return CertificateDto.builder()
                .id(certificate.getId())
                .certificateCode(certificate.getCertificateCode())
                .userId(certificate.getUser().getId())
                .userName(certificate.getUser().getName() != null ? certificate.getUser().getName() : certificate.getUser().getEmail())
                .userEmail(certificate.getUser().getEmail())
                .courseId(certificate.getCourse().getId())
                .courseTitle(certificate.getCourse().getTitle())
                .courseSlug(certificate.getCourse().getSlug())
                .issuedAt(certificate.getIssuedAt())
                .verificationUrl(baseUrl + "/certificates/verify/" + certificate.getCertificateCode())
                .build();
    }
}
