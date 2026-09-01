package com.mrdev.modules.help.controller;

import com.mrdev.common.dto.ApiResponse;
import com.mrdev.common.util.SecurityUtils;
import com.mrdev.modules.auth.model.User;
import com.mrdev.modules.auth.repository.UserRepository;
import com.mrdev.modules.help.service.TelegramLinkTokenService;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/telegram")
@RequiredArgsConstructor
public class TelegramLinkController {

    private final TelegramLinkTokenService linkTokenService;
    private final UserRepository userRepository;

    @Value("${app.telegram.bot-username:MrDevelopersbot}")
    private String botUsername;

    @Data
    @Builder
    public static class TelegramLinkResponse {
        private String token;
        private String botUsername;
        private String linkUrl;
    }

    @PostMapping("/link-token")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<TelegramLinkResponse>> generateLinkToken() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        String token = linkTokenService.createToken(currentUserId);
        String linkUrl = "https://t.me/" + botUsername + "?start=LINK_" + token;

        return ResponseEntity.ok(ApiResponse.success(TelegramLinkResponse.builder()
                .token(token)
                .botUsername(botUsername)
                .linkUrl(linkUrl)
                .build()));
    }

    @DeleteMapping("/unlink")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> unlinkTelegram() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        userRepository.findById(currentUserId).ifPresent(user -> {
            user.setTelegramChatId(null);
            user.setTelegramUsername(null);
            user.setTelegramLinkedAt(null);
            userRepository.save(user);
        });

        return ResponseEntity.ok(ApiResponse.success(null));
    }
}