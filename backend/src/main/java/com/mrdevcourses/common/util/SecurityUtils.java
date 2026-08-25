package com.mrdevcourses.common.util;

import com.mrdevcourses.common.exception.ApiException;
import com.mrdevcourses.modules.auth.model.Role;
import com.mrdevcourses.modules.auth.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

public final class SecurityUtils {

    private SecurityUtils() {
        // Prevent instantiation
    }

    public static Optional<UserPrincipal> getCurrentUserPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal() == null) {
            return Optional.empty();
        }
        if (authentication.getPrincipal() instanceof UserPrincipal principal) {
            return Optional.of(principal);
        }
        return Optional.empty();
    }

    public static Long getCurrentUserId() {
        return getCurrentUserPrincipal()
                .map(UserPrincipal::getId)
                .orElseThrow(() -> new ApiException("User is not authenticated", HttpStatus.UNAUTHORIZED));
    }

    public static Optional<Long> getCurrentUserIdOptional() {
        return getCurrentUserPrincipal().map(UserPrincipal::getId);
    }

    public static Role getCurrentUserRole() {
        return getCurrentUserPrincipal()
                .map(UserPrincipal::getRole)
                .orElseThrow(() -> new ApiException("User is not authenticated", HttpStatus.UNAUTHORIZED));
    }

    public static boolean isAuthenticated() {
        return getCurrentUserPrincipal().isPresent();
    }

    public static boolean isAdmin() {
        return getCurrentUserPrincipal()
                .map(p -> p.getRole() == Role.ADMIN)
                .orElse(false);
    }
}
