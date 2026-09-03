-- MrDevCourses: Migration V45 - Update Lesson 18 Full Content
-- Lesson 18: Code review: масштабируемость архитектуры, рефакторинг, финальный деплой Render + Vercel

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
        SET title = 'Code review: масштабируемость архитектуры, рефакторинг, финальный деплой Render + Vercel',
            content = '# Урок 18: Оптимизация БД, Code Review и Production Деплой Full-Stack

Финал третьей недели! Мы создали полноценный, защищённый Full-Stack сервис с бэкендом на Spring Boot 3, реляционной БД PostgreSQL и интерактивным интерфейсом с 3D-графикой. В этом уроке мы проведём глубокий аудит производительности, устраним самую коварную болезнь ORM-систем — проблему N+1 запросов, настроим стандартизированный глобальный обработчик ошибок и задеплоим всю систему в настоящий production на Render, Vercel и Neon.

## 1. Проблема N+1 запросов в Hibernate: как незаметно положить базу данных

Вспомни, как мы создавали связь между таблицами `accounts` (Счета) и `users` (Пользователи). В коде сущности написано:
```java
@ManyToOne(fetch = FetchType.LAZY)
private User user;
```

А теперь представь сценарий:
Ты открываешь список счетов и хочешь вывести имя владельца каждого счета.
В коде ты пишешь:
```java
List<Account> accounts = accountRepository.findAll();
for (Account acc : accounts) {
    System.out.println(acc.getUser().getEmail());
}
```

Что делает Hibernate под капотом?
1. Выполняет **1 запрос** за всеми счетами: `SELECT * FROM accounts;` (допустим, вернулось 50 счетов).
2. А затем для каждого отдельного счета делает ещё один отдельный запрос к базе:
   `SELECT * FROM users WHERE id = ?;`
   `SELECT * FROM users WHERE id = ?;`
   ... и так **ещё 50 раз**!

В итоге вместо одного быстрого обращения к базе данных твоё приложение отправляет **51 запрос**. Если у тебя 1 000 пользователей, база данных просто захлебнётся и упадёт с таймаутом.

> [!IMPORTANT]
> Это называется **проблемой N+1**: 1 базовый запрос порождает N дополнительных запросов. В тестах на двух записях ты этого не заметишь, но на боевом сервере под нагрузкой сервер моментально зависнет.

## 2. Лекарство от N+1: JOIN FETCH и EntityGraph

Решение на уровне архитектуры — явно сказать базе данных: *"Загрузи счета и пользователей одним махом в одном SQL-запросе"*.

В репозитории Spring Data JPA мы пишем оптимизированный JPQL-запрос:

```java
package com.moneytracker.account.repository;

import com.moneytracker.account.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    // Выполняется строго за ОДИН SQL-запрос через INNER/LEFT JOIN
    @Query("SELECT a FROM Account a JOIN FETCH a.user WHERE a.user.id = :userId ORDER BY a.createdAt DESC")
    List<Account> findAllByUserIdWithUser(@Param("userId") Long userId);
}
```

База данных соединяет таблицы за доли миллисекунды, и производительность возрастает в десятки раз.

## 3. Глобальный обработчик ошибок: вежливый бэкенд

Когда на сервере происходит непредвиденная ошибка (например, счёт с таким ID не найден или передана отрицательная сумма), по умолчанию Tomcat возвращает уродливую HTML-страницу со стектрейсом Java на 200 строк.

Клиентский фронтенд не может распарсить такой ответ и падает с непонятной ошибкой.

Профессиональный бэкенд всегда возвращает стандартизированный JSON через `@RestControllerAdvice`:

```java
package com.moneytracker.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
            "status", 404,
            "error", "NOT_FOUND",
            "message", ex.getMessage(),
            "timestamp", Instant.now().toString()
        ));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
            "status", 400,
            "error", "BAD_REQUEST",
            "message", ex.getMessage(),
            "timestamp", Instant.now().toString()
        ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
            "status", 500,
            "error", "INTERNAL_SERVER_ERROR",
            "message", "Внутренняя ошибка сервера. Пожалуйста, попробуйте позже.",
            "timestamp", Instant.now().toString()
        ));
    }
}
```

Теперь фронтенд всегда знает, что произошло, и может показать пользователю красивый тост.

## 4. Пошаговый деплой Full-Stack проекта в облако

Развернём всю систему на современных бесплатных облачных платформах:

### Шаг 1: Облачная база данных на Neon.tech
1. Зарегистрируйся на [neon.tech](https://neon.tech) через GitHub.
2. Создай проект `money-tracker-db`.
3. Скопируй строку подключения (Connection String) для JDBC:
   `jdbc:postgresql://ep-xyz.eu-central-1.aws.neon.tech/money-tracker?sslmode=require`

### Шаг 2: Деплой бэкенда на Render.com
1. Зайди на [render.com](https://render.com) и создай новый **Web Service**.
2. Подключи свой GitHub-репозиторий.
3. Укажи параметры:
   - Root Directory: `backend`
   - Build Command: `./gradlew clean build -x test`
   - Start Command: `java -jar build/libs/backend-0.0.1-SNAPSHOT.jar`
4. Добавь переменные окружения (Environment Variables):
   - `SPRING_DATASOURCE_URL`: (строка из Neon)
   - `SPRING_DATASOURCE_USERNAME`: (логин из Neon)
   - `SPRING_DATASOURCE_PASSWORD`: (пароль из Neon)
   - `APP_JWT_SECRET`: (64-символьная секретная строка)
   - `CORS_ALLOWED_ORIGINS`: `https://money-tracker-app.vercel.app`
5. Нажми **Create Web Service**. Render соберёт JAR и автоматически применит все Flyway-миграции!

### Шаг 3: Деплой фронтенда на Vercel.com
1. Зайди на [vercel.com](https://vercel.com) и нажми **Add New Project**.
2. Выбери свой репозиторий.
3. Укажи Root Directory: `frontend`.
4. В разделе **Environment Variables** добавь:
   - `VITE_API_URL`: `https://твой-бэкенд.onrender.com/api`
5. Нажми **Deploy**. Через 30 секунд сайт готов!

> [!TIP]
> Открой сайт на Vercel, зарегистрируй нового пользователя и сделай пару транзакций. Проверь базу на Neon — данные сохранены в облаке и доступны из любой точки мира!

## Чек-лист урока

- [ ] Изучена природа проблемы N+1 запросов и проведён аудит репозиториев
- [ ] Оптимизированы SQL-запросы с помощью `JOIN FETCH`
- [ ] Реализован централизованный `GlobalExceptionHandler` с чистыми JSON-ответами
- [ ] База данных PostgreSQL развёрнута в облаке Neon.tech
- [ ] Spring Boot бэкенд успешно задеплоен на Render.com
- [ ] React фронтенд опубликован на Vercel.com и связан с боевым API'
        WHERE course_id = target_course_id AND day_number = 18;
    END IF;
END $$;
