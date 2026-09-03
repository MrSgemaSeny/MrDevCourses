-- MrDevCourses: Migration V51 - Update Lesson 24 Full Content
-- Lesson 24: Production-режим: smoke testing, мониторинг, работа с живыми данными

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
        SET title = 'Production-режим: smoke testing, мониторинг, работа с живыми данными',
            content = '# Урок 24: Smoke Testing, Мониторинг и Защита в Production — финал CRM

Финал четвёртой недели! Твоя CRM Kanban система официально живёт в продакшене. Но настоящий инженер знает: задеплоить код — это лишь половина победы. Главное — убедиться, что система стабильно работает под нагрузкой, не падает от неожиданных действий пользователей и оперативно сообщает тебе о сбоях до того, как о них напишут недовольные клиенты. Сегодня мы проведём Smoke-тестирование, настроим системный мониторинг через Spring Boot Actuator и внедрим защиту от перегрузок (Rate Limiting).

## 1. Smoke Testing: проверка боевой готовности за 3 минуты

Термин "Smoke Testing" (дымовое тестирование) пришёл из радиоэлектроники: при первой подаче напряжения на плату инженеры смотрели, "не пошёл ли дым". Если дым пошёл — подробные тесты проводить бессмысленно, надо сразу тушить и чинить базу.

В веб-сервисах Smoke Testing — это критический экспресс-тест ключевых жизненных артерий приложения сразу после деплоя в продакшен.

Пройди по этому чек-листу на боевом домене Vercel:

| № | Проверяемый шаг | Что именно делаем | Ожидаемый результат |
|---|---|---|---|
| 1 | Healthcheck бэкенда | Открываем `https://api.yourdomain.com/api/v1/system/health` в браузере | Ответ `{ "status": "UP" }`, HTTP 200 |
| 2 | Загрузка главной страницы | Открываем веб-приложение в режиме инкогнито без кэша | Чистая загрузка за < 1.5 сек, нет ошибок в консоли F12 |
| 3 | Авторизация и JWT | Входим через тестовую учётную запись | Появляется httpOnly cookie с токеном, открывается доска |
| 4 | Перемещение карточки | Перетаскиваем сделку мышкой из "Новая" в "В работе" | Карточка встаёт мгновенно (Optimistic UI), улетает PATCH запрос |
| 5 | Мобильное уведомление | Проверяем Telegram-чат | Бот прислал алерт со сменой стадии за доли секунды |
| 6 | Персистентность | Обновляем страницу по F5 | Карточка осталась в новой колонке, данные сохранены в PostgreSQL |

Если все 6 шагов прошли успешно — твоё приложение стабильно функционирует в реальном мире.

## 2. Spring Boot Actuator: приборная панель твоего сервера

Как узнать, сколько оперативной памяти потребляет твой бэкенд прямо сейчас? Не кончились ли свободные соединения в пуле базы данных HikariCP?

Для этого в Spring Boot существует инструмент **Actuator**. Он предоставляет готовые защищённые HTTP-эндпоинты для мониторинга:

Добавим зависимость в `build.gradle`:
```groovy
implementation ''org.springframework.boot:spring-boot-starter-actuator''
implementation ''io.micrometer:micrometer-registry-prometheus''
```

Настроим видимость эндпоинтов в `application.yml`:
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: when_authorized
  metrics:
    tags:
      application: ${spring.application.name}
```

Теперь эндпоинт `/api/actuator/health` возвращает детальную диагностику:
```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "PostgreSQL",
        "validationQuery": "isValid()"
      }
    },
    "diskSpace": {
      "status": "UP",
      "details": {
        "free": 12845678900
      }
    }
  }
}
```

## 3. Защита от спама и DDoS: Token Bucket Rate Limiting

Любой открытый публичный API рано или поздно находят боты или спамеры. Если кто-то запустит скрипт, отправляющий 500 запросов в секунду на перемещение карточек, твой сервер упадет, а лимиты бесплатного хостинга исчерпаются за 10 минут.

Для защиты мы внедряем алгоритм **Token Bucket** с помощью библиотеки `Bucket4j`:

```java
package com.moneytracker.common.ratelimit;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitingFilter implements Filter {

    // Хранилище лимитов по IP-адресам
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    private Bucket createNewBucket() {
        // Разрешаем максимум 60 запросов в минуту от одного IP-адреса
        Bandwidth limit = Bandwidth.classic(60, Refill.greedy(60, Duration.ofMinutes(1)));
        return Bucket.builder().addLimit(limit).build();
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String clientIp = httpRequest.getRemoteAddr();
        Bucket bucket = buckets.computeIfAbsent(clientIp, k -> createNewBucket());

        if (bucket.tryConsume(1)) {
            // Лимит не превышен — пропускаем запрос дальше
            chain.doFilter(request, response);
        } else {
            // Превышение лимита — возвращаем HTTP 429 Too Many Requests
            httpResponse.setStatus(429);
            httpResponse.setContentType("application/json");
            httpResponse.getWriter().write("{\"error\": \"TOO_MANY_REQUESTS\", \"message\": \"Слишком много запросов. Попробуйте через минуту.\"}");
        }
    }
}
```

## 4. Итоги 4-й недели: зрелость системы

Поздравляем! К концу четвёртой недели у тебя работает:
- Сложная CRM Kanban система на React 19 и `@dnd-kit`.
- Оптимистичный UI с мгновенным откликом и фоновой синхронизацией.
- Надёжный бэкенд на Java 17 с аудитом и валидацией.
- Мгновенные мобильные алерты через Telegram-бота.
- Автоматизированный CI/CD пайплайн в GitHub Actions.
- Защита от перегрузок (Rate Limiting) и мониторинг Actuator.

> [!IMPORTANT]
> На следующей, финальной 5-й неделе курса мы выйдем на **Уровень 3 (AI Core & High-Load)**: создадим мультимодальный суперапп **Pensee**, подключим LLM API Claude / OpenAI, реализуем streaming ответов через Server-Sent Events (SSE) и внедрим векторный поиск RAG на PostgreSQL с расширением `pgvector`!

## Чек-лист урока

- [ ] Проведены все 6 шагов Smoke-тестирования в реальном продакшене
- [ ] Подключен и настроен модуль Spring Boot Actuator
- [ ] Проверен эндпоинт `/api/actuator/health` со статусом базы данных
- [ ] Внедрен фильтр ограничения частоты запросов Rate Limiting (HTTP 429)
- [ ] Зафиксирован релизный коммит 4-й недели в ветку main'
        WHERE course_id = target_course_id AND day_number = 24;
    END IF;
END $$;
