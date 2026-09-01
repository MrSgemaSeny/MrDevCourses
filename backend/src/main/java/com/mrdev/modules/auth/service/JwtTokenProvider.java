package com.mrdev.modules.auth.service;

import com.mrdev.modules.auth.model.Role;
import com.mrdev.modules.auth.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.function.Function;

@Slf4j
@Service
public class JwtTokenProvider {

    private final SecretKey key;
    private final long expirationMs;
    private final long rememberMeExpirationMs;

    @Autowired
    public JwtTokenProvider(
            @Value("${app.jwt.secret:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}") String secret,
            @Value("${app.jwt.expiration-ms:604800000}") long expirationMs,
            @Value("${app.jwt.remember-me-expiration-ms:2592000000}") long rememberMeExpirationMs) {
        this.expirationMs = expirationMs;
        this.rememberMeExpirationMs = rememberMeExpirationMs;
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            byte[] padded = new byte[32];
            System.arraycopy(keyBytes, 0, padded, 0, keyBytes.length);
            this.key = Keys.hmacShaKeyFor(padded);
        } else {
            this.key = Keys.hmacShaKeyFor(keyBytes);
        }
    }

    public JwtTokenProvider(String secret, long expirationMs) {
        this(secret, expirationMs, expirationMs * 4);
    }

    public String generateToken(User user) {
        return generateToken(user.getId(), user.getEmail(), user.getRole(), false);
    }

    public String generateToken(User user, boolean rememberMe) {
        return generateToken(user.getId(), user.getEmail(), user.getRole(), rememberMe);
    }

    public String generateToken(Long userId, String email, Role role) {
        return generateToken(userId, email, role, false);
    }

    public String generateToken(Long userId, String email, Role role, boolean rememberMe) {
        Date now = new Date();
        long ttl = rememberMe ? rememberMeExpirationMs : expirationMs;
        Date expiryDate = new Date(now.getTime() + ttl);

        return Jwts.builder()
                .id(java.util.UUID.randomUUID().toString())
                .subject(String.valueOf(userId))
                .claim("userId", userId)
                .claim("email", email)
                .claim("role", role.name())
                .claim("rememberMe", rememberMe)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key, Jwts.SIG.HS256)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    public String getJtiFromToken(String token) {
        Claims claims = extractAllClaims(token);
        return claims.getId();
    }

    public Date getExpirationDateFromToken(String token) {
        Claims claims = extractAllClaims(token);
        return claims.getExpiration();
    }

    public Long getUserIdFromToken(String token) {
        Claims claims = extractAllClaims(token);
        Object userIdObj = claims.get("userId");
        if (userIdObj != null) {
            if (userIdObj instanceof Number number) {
                return number.longValue();
            }
            return Long.parseLong(userIdObj.toString());
        }
        return Long.parseLong(claims.getSubject());
    }

    public String getEmailFromToken(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("email", String.class);
    }

    public Role getRoleFromToken(String token) {
        Claims claims = extractAllClaims(token);
        String roleStr = claims.get("role", String.class);
        return roleStr != null ? Role.valueOf(roleStr) : Role.STUDENT;
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }
}
