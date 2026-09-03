-- MrDevCourses: Migration V53 - Update Lesson 26 Full Content
-- Lesson 26: Подключение LLM API: Claude / OpenAI, prompt engineering, обработка ошибок и стоимость токенов

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
        SET title = 'Подключение LLM API: Claude / OpenAI, prompt engineering, обработка ошибок и стоимость токенов',
            content = '# Урок 26: Интеграция LLM API: Claude, OpenAI и Groq на бэкенде

Сегодня мы сделаем первый шаг к настоящему AI-бэкенду: научим наше Spring Boot приложение общаться с флагманскими языковыми моделями (Anthropic Claude 3.5 Sonnet, OpenAI GPT-4o, Groq Llama 3). Мы разберёмся, как рассчитывать стоимость токенов, как настроить неблокирующий реактивный WebClient и как маскировать конфиденциальные данные (PII) до того, как они покинут наш сервер.

## 1. Как устроен REST API языковых моделей

Для работы с нейросетью из кода не нужны волшебные библиотеки. Любой LLM провайдер предоставляет стандартный HTTP REST API:
- Ты отправляешь POST-запрос с JSON-телом, содержащим массив сообщений:
  ```json
  {
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 1024,
    "system": "Ты — персональный финансовый советник в приложении Pensee...",
    "messages": [
      { "role": "user", "content": "Сколько денег у меня на счетах?" }
    ]
  }
  ```
- Сервер модели возвращает ответ со сгенерированным текстом и отчётом по токенам (`usage`):
  `input_tokens: 45`, `output_tokens: 120`.

## 2. Экономика токенов: как не разориться на API

Токены — это "топливо" для нейросетей. Грубо говоря, 1 токен ≈ 4 символа текста (или 0.75 слова).
- 1 000 токенов — это примерно страница печатного текста.
- Входные токены (твой промпт и контекст) стоят дешевле.
- Выходные токены (то, что сгенерировал AI) стоят в 3-5 раз дороже.

> [!NOTE]
> Всегда указывай строгий параметр `max_tokens` (например, 1024 или 2048). Если пользователь попросит AI написать "историю человечества в деталях", без лимита модель будет генерировать текст 5 минут и спишет с твоей карты 5-10 долларов за один запрос.

## 3. Настройка неблокирующего WebClient в Spring Boot

В Java 17 для высоконагруженных сетевых запросов мы используем `WebClient` из Spring WebFlux вместо устаревшего блокирующего `RestTemplate`:

```java
package com.moneytracker.ai.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;

@Configuration
public class LlmWebClientConfig {

    @Value("${app.anthropic.api-key:}")
    private String anthropicApiKey;

    @Bean(name = "anthropicWebClient")
    public WebClient anthropicWebClient() {
        // Настраиваем таймауты: если нейросеть думает дольше 20 секунд — обрываем соединение
        HttpClient httpClient = HttpClient.create()
                .responseTimeout(Duration.ofSeconds(20));

        return WebClient.builder()
                .baseUrl("https://api.anthropic.com/v1")
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .defaultHeader("x-api-key", anthropicApiKey)
                .defaultHeader("anthropic-version", "2023-06-01")
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }
}
```

## 4. Защита персональных данных: компонент PiiDataMasker

Когда пользователь общается с AI, он может случайно отправить свой номер банковской карты, телефон, пароль или паспортные данные. Отправлять такую информацию во внешние американские серверы категорически запрещено законами о защите персональных данных (GDPR и 152-ФЗ).

Перед отправкой промпта мы пропускаем текст через фильтр **PII (Personally Identifiable Information) Masker**:

```java
package com.moneytracker.ai.security;

import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

@Component
public class PiiDataMasker {

    // Регулярные выражения для поиска чувствительных данных
    private static final Pattern CARD_PATTERN = Pattern.compile("\\b(?:\\d[ -]*?){13,16}\\b");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("(?i)[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}");
    private static final Pattern PHONE_PATTERN = Pattern.compile("(?:\\+?\\d{1,3}[- ]?)?\\(?\\d{3}\\)?[- ]?\\d{3}[- ]?\\d{4}");

    public String mask(String rawText) {
        if (rawText == null || rawText.isBlank()) return rawText;

        String safeText = CARD_PATTERN.matcher(rawText).replaceAll("[НОМЕР_КАРТЫ_СКРЫТ]");
        safeText = EMAIL_PATTERN.matcher(safeText).replaceAll("[EMAIL_СКРЫТ]");
        safeText = PHONE_PATTERN.matcher(safeText).replaceAll("[ТЕЛЕФОН_СКРЫТ]");

        return safeText;
    }
}
```

## 5. Вызов модели и обработка сетевых ошибок

Напишем сервис отправки промпта с автоматической защитой от падений:

```java
package com.moneytracker.ai.service;

import com.moneytracker.ai.security.PiiDataMasker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
public class ClaudeService {

    private static final Logger log = LoggerFactory.getLogger(ClaudeService.class);
    private final WebClient webClient;
    private final PiiDataMasker masker;

    public ClaudeService(@Qualifier("anthropicWebClient") WebClient webClient, PiiDataMasker masker) {
        this.webClient = webClient;
        this.masker = masker;
    }

    public String askAssistant(String userPrompt) {
        // 1. Очищаем конфиденциальные данные
        String sanitizedPrompt = masker.mask(userPrompt);

        // 2. Формируем тело запроса к Claude 3.5 Sonnet
        Map<String, Object> requestBody = Map.of(
            "model", "claude-3-5-sonnet-20241022",
            "max_tokens", 1024,
            "system", "Ты — персональный AI ассистент Pensee. Отвечай кратко, чётко и только по делу.",
            "messages", List.of(Map.of("role", "user", "content", sanitizedPrompt))
        );

        try {
            // 3. Выполняем неблокирующий HTTP POST запрос
            Map response = webClient.post()
                    .uri("/messages")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block(); // Для синхронного вызова

            List contentList = (List) response.get("content");
            Map firstContent = (Map) contentList.get(0);
            return (String) firstContent.get("text");

        } catch (Exception e) {
            log.error("Claude API error: {}", e.getMessage());
            return "К сожалению, сервис AI временно недоступен. Пожалуйста, попробуйте чуть позже.";
        }
    }
}
```

## Чек-лист урока

- [ ] Изучена структура запросов и тарификация токенов в LLM API
- [ ] Настроен реактивный `WebClient` с пулом таймаутов
- [ ] Разработан компонент `PiiDataMasker` для защиты номеров карт и телефонов
- [ ] Реализован сервис `ClaudeService` с безопасной обработкой исключений
- [ ] Протестирован успешный вызов AI-модели из бэкенда'
        WHERE course_id = target_course_id AND day_number = 26;
    END IF;
END $$;
