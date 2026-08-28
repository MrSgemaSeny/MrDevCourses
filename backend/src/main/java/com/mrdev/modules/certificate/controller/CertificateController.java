package com.mrdev.modules.certificate.controller;

import com.mrdev.common.dto.ApiResponse;
import com.mrdev.common.util.SecurityUtils;
import com.mrdev.modules.certificate.dto.CertificateDto;
import com.mrdev.modules.certificate.service.CertificateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1")
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService certificateService;

    @PostMapping("/courses/{courseId}/certificate")
    public ResponseEntity<ApiResponse<CertificateDto>> issueCertificate(@PathVariable Long courseId) {
        Long userId = SecurityUtils.getCurrentUserId();
        CertificateDto dto = certificateService.issueCertificateIfEligible(userId, courseId);
        return ResponseEntity.ok(ApiResponse.success("Сертификат успешно выдан", dto));
    }

    @GetMapping("/courses/{courseId}/certificate")
    public ResponseEntity<ApiResponse<CertificateDto>> getCertificate(@PathVariable Long courseId) {
        Long userId = SecurityUtils.getCurrentUserId();
        CertificateDto dto = certificateService.getCertificate(userId, courseId);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @GetMapping("/certificates/verify/{code}")
    public ResponseEntity<ApiResponse<CertificateDto>> verifyCertificate(@PathVariable String code) {
        CertificateDto dto = certificateService.verifyCertificate(code);
        return ResponseEntity.ok(ApiResponse.success("Сертификат подлинный", dto));
    }

    @GetMapping("/certificates/{code}/pdf")
    public ResponseEntity<byte[]> downloadCertificatePdf(@PathVariable String code) {
        byte[] pdfBytes = certificateService.generatePdfForCertificate(code);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"certificate-" + code + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
