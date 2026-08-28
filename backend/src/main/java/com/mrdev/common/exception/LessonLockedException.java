package com.mrdev.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

import java.time.Instant;

@Getter
public class LessonLockedException extends ApiException {
    private final Instant opensAt;

    public LessonLockedException(String message, Instant opensAt) {
        super(message, HttpStatus.FORBIDDEN);
        this.opensAt = opensAt;
    }

    public LessonLockedException(Instant opensAt) {
        super("Урок заблокирован. Он станет доступен: " + opensAt.toString(), HttpStatus.FORBIDDEN);
        this.opensAt = opensAt;
    }
}
