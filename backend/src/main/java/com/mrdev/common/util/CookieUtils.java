package com.mrdev.common.util;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.util.SerializationUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.Optional;

@Slf4j
public class CookieUtils {

    private static final String HMAC_ALGORITHM = "HmacSHA256";
    // HMAC signing secret for session and OAuth2 authorization request cookies
    private static final byte[] HMAC_SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970".getBytes(StandardCharsets.UTF_8);

    public static Optional<Cookie> getCookie(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null && cookies.length > 0) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals(name)) {
                    return Optional.of(cookie);
                }
            }
        }
        return Optional.empty();
    }

    public static void addCookie(HttpServletResponse response, String name, String value, int maxAge) {
        Cookie cookie = new Cookie(name, value);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(maxAge);
        response.addCookie(cookie);
    }

    public static void deleteCookie(HttpServletRequest request, HttpServletResponse response, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null && cookies.length > 0) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals(name)) {
                    cookie.setValue("");
                    cookie.setPath("/");
                    cookie.setMaxAge(0);
                    response.addCookie(cookie);
                }
            }
        }
    }

    public static String serialize(Object object) {
        if (object == null) {
            return null;
        }
        byte[] payloadBytes = SerializationUtils.serialize(object);
        byte[] signatureBytes = computeHmac(payloadBytes, HMAC_SECRET);
        String signature = Base64.getUrlEncoder().withoutPadding().encodeToString(signatureBytes);
        String payload = Base64.getUrlEncoder().withoutPadding().encodeToString(payloadBytes);
        return signature + "." + payload;
    }

    public static <T> T deserialize(Cookie cookie, Class<T> cls) {
        if (cookie == null || cookie.getValue() == null || cookie.getValue().isBlank()) {
            return null;
        }

        String rawValue = cookie.getValue();
        int dotIndex = rawValue.indexOf('.');
        if (dotIndex <= 0 || dotIndex == rawValue.length() - 1) {
            log.warn("Invalid signed cookie format for: {}", cookie.getName());
            return null;
        }

        String receivedSigBase64 = rawValue.substring(0, dotIndex);
        String payloadBase64 = rawValue.substring(dotIndex + 1);

        try {
            byte[] receivedSignature = Base64.getUrlDecoder().decode(receivedSigBase64);
            byte[] payloadBytes = Base64.getUrlDecoder().decode(payloadBase64);

            byte[] expectedSignature = computeHmac(payloadBytes, HMAC_SECRET);

            if (!MessageDigest.isEqual(expectedSignature, receivedSignature)) {
                log.warn("Tampered or invalid HMAC signature on cookie: {}", cookie.getName());
                return null;
            }

            Object obj = SerializationUtils.deserialize(payloadBytes);
            return cls.cast(obj);
        } catch (Exception e) {
            log.error("Failed to safely deserialize signed cookie {}: {}", cookie.getName(), e.getMessage());
            return null;
        }
    }

    private static byte[] computeHmac(byte[] data, byte[] key) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(key, HMAC_ALGORITHM));
            return mac.doFinal(data);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to compute HMAC-SHA256", e);
        }
    }
}
