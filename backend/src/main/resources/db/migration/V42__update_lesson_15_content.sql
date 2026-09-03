-- MrDevCourses: Migration V42 - Update Lesson 15 Full Content
-- Lesson 15: Закладка архитектуры: RBAC, JWT-аутентификация, защищённые роуты, миграции схемы

DO $$
DECLARE
    target_course_id BIGINT;
BEGIN
    SELECT id INTO target_course_id FROM courses WHERE slug = 'mrdeveloper' LIMIT 1;
    IF target_course_id IS NULL THEN
        SELECT id INTO target_course_id FROM courses WHERE slug = 'vibecoding-zero-to-one' LIMIT 1;
    END IF;
    IF target_course_id IS NULL THEN
        SELECT id INTO target_course_id FROM courses ORDER BY id ASC LIMIT 1;
    END IF;

    IF target_course_id IS NOT NULL THEN
        UPDATE lessons 
        SET title = 'Закладка архитектуры: RBAC, JWT-аутентификация, защищённые роуты, миграции схемы',
            content = '# Урок 15: Безопасность: Stateless JWT в httpOnly Cookies и Flyway

Безопасность — фундаментальный приоритет в финтех-приложениях. Сегодня мы создадим систему миграций базы данных Flyway, настроим ролевую модель RBAC (Role-Based Access Control) и реализуем защищённую stateless авторизацию на JSON Web Tokens (JWT) с защитой от XSS и CSRF атак.

## 1. Контроль версий базы данных: почему Flyway обязателен

В продакшене нельзя вручную выполнять `CREATE TABLE` в pgAdmin или надеяться на `hibernate.ddl-auto: update`. Почему?
- Невозможно отследить, кто и когда изменил структуру таблицы.
- При деплое на сервер база данных рассинхронизируется с Java-кодом.
- Нет возможности автоматического отката и воспроизведения на чистой машине.

Flyway хранит историю изменений в таблице `flyway_schema_history`. Каждый файл миграции `V{N}__{description}.sql` применяется строго один раз и проверяется по контрольной сумме (checksum).

## 2. Первая миграция схемы (`db/migration/V1__init_schema.sql`)

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT ''STUDENT'',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE accounts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT ''KZT'',
    balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_accounts_user_id ON accounts(user_id);
```

## 3. Почему JWT хранится в httpOnly Cookie, а не в LocalStorage

Если сохранить JWT в `LocalStorage`, любая XSS-уязвимость (например, вредоносная строчка в комментариях или скомпрометированный npm-пакет) может выполнить `localStorage.getItem("token")` и отправить его злоумышленнику.

Когда токен передаётся в cookie с флагом `httpOnly: true` и `SameSite: Lax`:
1. Браузер блокирует доступ к cookie из любого JavaScript-кода (`document.cookie` не видит токен).
2. Браузер сам автоматически прикрепляет cookie к каждому запросу к API.
3. Сессия остаётся stateless: бэкенду не нужно хранить состояние в оперативной памяти сервера.

## 4. Сервис выпуска и валидации JWT (`JwtService.java`)

```java
package com.moneytracker.auth.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    @Value("404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970")
    private String jwtSecret;

    private static final long EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000L; // 7 дней

    public String generateToken(Long userId, String email, String role) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
                .subject(email)
                .claim("userId", userId)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_MS))
                .signWith(key)
                .compact();
    }

    public Claims validateAndExtractClaims(String token) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
```

## 5. Конфигурация Spring Security 6

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthenticationFilter jwtFilter) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**", "/api/v1/system/**").permitAll()
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12); // Надежное хеширование с солью
    }
}
```

## Чек-лист урока

- [ ] Написана и успешно применена первая Flyway миграция `V1__init_schema.sql`
- [ ] Настроено безопасное хеширование паролей через `BCryptPasswordEncoder`
- [ ] Реализован сервис выпуска JWT токенов с подписью HMAC-SHA256
- [ ] Настроена установка токена в `httpOnly` cookie с флагом `SameSite=Lax`
- [ ] Защищены эндпоинты через фильтр Spring Security 6'
        WHERE course_id = target_course_id AND day_number = 15;
    END IF;
END $$;
