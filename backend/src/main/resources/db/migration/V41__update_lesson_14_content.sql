-- MrDevCourses: Migration V41 - Update Lesson 14 Full Content
-- Lesson 14: Инициализация full-stack: настройка фронтенда, бэкенда и БД, связка окружений

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
        SET title = 'Инициализация full-stack: настройка фронтенда, бэкенда и БД, связка окружений',
            content = '# Урок 14: Инициализация Full-Stack проекта (Spring Boot 3 + PostgreSQL) — связываем миры

В этом уроке мы сделаем то, что многие считают самым сложным шагом в карьере веб-разработчика: поднимем настоящий enterprise-бэкенд на Java 17 и Spring Boot 3, установим соединение с реляционной базой данных PostgreSQL через высокопроизводительный пул HikariCP, настроим политику безопасности CORS и сделаем первый сквозной асинхронный запрос из React приложения.

## 1. Стек бэкенда: почему Java 17 и Spring Boot 3 выбирают для больших денег

В мире веб-разработки есть десятки языков: Python, Node.js, PHP, Go, Ruby. Почему мы выбираем связку Java 17 + Spring Boot 3 для нашего финансового сервиса?

1. **Строгая статическая типизация**: В финансовом сервисе ошибка в одну букву или передача строки вместо числа может стоить миллионы. Компилятор Java просто не позволит запустить сломанный код.
2. **Spring Framework — мировой корпоративный стандарт**: Более 70% мировых банковских и финтех-систем работают на Spring. Изучив эту экосистему, ты получаешь навыки, которые ценятся выше всего на рынке.
3. **Безупречная многопоточность**: Встроенный сервер Apache Tomcat обрабатывает тысячи одновременных запросов пользователей без блокировки и зависаний.
4. **Spring Data JPA**: Автоматическая генерация оптимизированных SQL-запросов без необходимости писать сотни строк шаблонного кода.

> [!NOTE]
> Не бойся "сложности" Java. В связке с AI-ассистентами вайбкодинга разработка на Spring Boot идёт так же быстро, как на Node.js или Python, но на выходе ты получаешь несокрушимо надёжную систему промышленного уровня.

## 2. Архитектура взаимодействия Frontend и Backend

Давай разберём, как устроено общение между браузером и сервером во время локальной разработки:

```
[Браузер пользователя]
  │
  ├─ 1. Загружает клиентский интерфейс: http://localhost:5173 (React Vite Dev Server)
  │
  └─ 2. Отправляет асинхронный fetch-запрос:
        GET http://localhost:8080/api/v1/system/health
        │
        ▼
[Spring Boot Сервер: порт 8080]
  │
  ├─ 3. Фильтр CORS проверяет: "Разрешено ли источнику :5173 делать запросы?"
  ├─ 4. Контроллер обрабатывает запрос
  ├─ 5. Пул соединений HikariCP делает проверочный запрос к PostgreSQL (порт 5432)
  │
  └─ 6. Возвращает браузеру JSON ответ: { "status": "UP", "service": "MoneyTracker" }
```

## 3. Конфигурация соединения с базой данных (`application.yml`)

В Spring Boot вся конфигурация хранится в лаконичном YAML-файле:

```yaml
spring:
  application:
    name: MoneyTracker
  datasource:
    url: jdbc:postgresql://localhost:5432/money_tracker
    username: postgres
    password: your_password
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 10   # Максимум 10 одновременных соединений к БД
      minimum-idle: 2         # Всегда держим 2 готовых соединения
      connection-timeout: 20000 # 20 секунд ожидания свободного соединения
  jpa:
    open-in-view: false       # Защита от утечек соединений в продакшене!
    hibernate:
      ddl-auto: validate     # СТРОГИЙ ЗАПРЕТ на автоизменение таблиц! Только Flyway!
    properties:
      hibernate:
        jdbc:
          time_zone: UTC      # Все даты и время хранятся строго в UTC

server:
  port: 8080
  servlet:
    context-path: /api        # Все эндпоинты будут начинаться с префикса /api
```

> [!IMPORTANT]
> Настройка `open-in-view: false` — золотой стандарт Senior-разработчиков. По умолчанию Spring держит соединение с базой открытым, пока формируется JSON-ответ. При 50 пользователях соединения заканчиваются, и сервер падает. Выключение OSIV гарантирует закрытие соединения сразу после выхода из сервиса.

## 4. Что такое CORS и как настроить безопасность

По умолчанию браузер блокирует любые запросы, если фронтенд запущен на порту `5173`, а бэкенд — на порту `8080`. Браузер считает это потенциальной хакерской атакой (Cross-Origin Resource Sharing).

Чтобы подружить наши приложения, настроим `WebMvcConfigurer`:

```java
package com.moneytracker.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                // Разрешаем запросы строго с адреса нашего локального фронтенда
                .allowedOrigins("http://localhost:5173", "http://127.0.0.1:5173")
                // Разрешаем все необходимые методы HTTP
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                // РАЗРЕШАЕМ передачу httpOnly cookies с токенами авторизации!
                .allowCredentials(true);
    }
}
```

## 5. Создание контроллера Health Check (`HealthController.java`)

Напишем наш первый REST-контроллер для мониторинга:

```java
package com.moneytracker.system;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/v1/system")
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getHealthStatus() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "MoneyTracker Backend Core",
            "environment", "development",
            "timestamp", Instant.now().toString()
        ));
    }
}
```

## 6. Проверка сквозного запроса из React

В проекте фронтенда создадим функцию проверки связи:

```typescript
export const checkServerStatus = async () => {
  try {
    const response = await fetch(''http://localhost:8080/api/v1/system/health'', {
      method: ''GET'',
      credentials: ''include'',
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    console.log(''Бэкенд успешно ответил:'', data);
    return data;
  } catch (error) {
    console.error(''Не удалось подключиться к серверу:'', error);
    throw error;
  }
};
```

Запусти фронтенд и бэкенд одновременно: на экране консоли появится зелёный ответ `{ status: "UP" }`! Связка работает!

## Чек-лист урока

- [ ] Установлен JDK 17, проверена версия через команду `java -version`
- [ ] Создана локальная база данных `money_tracker` в PostgreSQL
- [ ] Сконфигурирован `application.yml` с пулом соединений HikariCP и UTC-временем
- [ ] Настроен фильтр CORS с параметром `allowCredentials(true)`
- [ ] Написан REST-контроллер `/api/v1/system/health`
- [ ] Выполнен первый успешный сквозной запрос из React фронтенда на Spring Boot бэкенд'
        WHERE course_id = target_course_id AND day_number = 14;
    END IF;
END $$;
