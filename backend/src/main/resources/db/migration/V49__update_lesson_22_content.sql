-- MrDevCourses: Migration V49 - Update Lesson 22 Full Content
-- Lesson 22: Telegram Bot: webhook-интеграция, алерты, уведомления о событиях CRM

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
        SET title = 'Telegram Bot: webhook-интеграция, алерты, уведомления о событиях CRM',
            content = '# Урок 22: Интеграция Telegram Bot и Push-алерты о событиях CRM

В бизнесе скорость решает всё. Если менеджер узнаёт о новой заявке через 3 часа — клиент уже ушёл к конкуренту. В этом уроке мы создадим надёжный сервис интеграции с Telegram на Spring Boot 3, который будет мгновенно присылать форматированные уведомления о ключевых событиях CRM (новая заявка, смена стадии, закрытие сделки на крупную сумму).

## 1. Как устроен Telegram Bot API: архитектура на пальцах

Telegram Bot API — это один из самых удобных и стабильных протоколов в мире. Твоему серверу не нужно держать сложные постоянные соединения:
- Бот — это специальный аккаунт в Telegram, управляемый программой.
- Чтобы отправить сообщение в любой чат, твой бэкенд делает обычный HTTP POST запрос на адрес:
  `https://api.telegram.org/bot<ТОКЕН_БОТА>/sendMessage`
- В теле запроса передаются два главных параметра:
  1. `chat_id`: уникальный числовой идентификатор пользователя или группы, куда слать сообщение.
  2. `text`: сам текст сообщения (с поддержкой Markdown или HTML).

```
┌─────────────────────────┐      HTTP POST sendMessage       ┌────────────────────────┐
│   Spring Boot Backend   │ ───────────────────────────────> │    Telegram Bot API    │
│  (CrmCardService.java)  │   JSON: { chat_id, text }        └───────────┬────────────┘
└─────────────────────────┘                                              │
                                                                         │ Доставка за 0.1 сек
                                                                         ▼
                                                             ┌────────────────────────┐
                                                             │ Смартфон руководителя  │
                                                             │ (Telegram Push Alert)  │
                                                             └────────────────────────┘
```

## 2. Как узнать свой chat_id

Перед отправкой сообщений нужно узнать `chat_id` чата, куда бот будет присылать отчёты:

1. Открой Telegram и найди своего бота, которого ты создал на прошлом уроке через `@BotFather`.
2. Нажми кнопку **Start** (или отправь сообщение `/start`).
3. Теперь открой браузер и перейди по ссылке (подставь свой токен):
   `https://api.telegram.org/bot<ТВОЙ_ТОКЕН>/getUpdates`
4. В ответе ты увидишь JSON. Найди блок `"chat":{"id": 123456789}`.
5. Это число и есть твой персональный `chat_id`! Сохрани его.

> [!NOTE]
> Если ты хочешь отправлять уведомления в общую группу команды: добавь бота в группу, дай ему права администратора, напиши любое сообщение в группу и снова открой `getUpdates`. ID группы будет отрицательным числом (например, `-1001987654321`).

## 3. Разработка TelegramNotificationService в Spring Boot

Создадим отказоустойчивый сервис. Если токен не задан в конфигурации (например, при запуске локальных тестов), сервис не должен падать с ошибкой, а должен просто логировать сообщение в консоль:

```java
package com.moneytracker.crm.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.Map;

@Service
public class TelegramNotificationService {

    private static final Logger log = LoggerFactory.getLogger(TelegramNotificationService.class);

    @Value("${app.telegram.bot-token:}")
    private String botToken;

    @Value("${app.telegram.chat-id:}")
    private String chatId;

    private final RestTemplate restTemplate;

    public TelegramNotificationService(RestTemplateBuilder builder) {
        // Настраиваем таймауты, чтобы зависший запрос к Telegram не блокировал бэкенд
        this.restTemplate = builder
                .setConnectTimeout(Duration.ofSeconds(3))
                .setReadTimeout(Duration.ofSeconds(5))
                .build();
    }

    /**
     * Асинхронное уведомление о смене стадии карточки
     */
    @Async
    public void notifyCardMoved(String cardTitle, String fromColumn, String toColumn, BigDecimal dealValue) {
        if (botToken == null || botToken.isBlank() || chatId == null || chatId.isBlank()) {
            log.info("[Local CRM Alert]: Карточка ''{}'' перемещена из ''{}'' в ''{}'' (Сумма: {} ₸)",
                    cardTitle, fromColumn, toColumn, dealValue);
            return;
        }

        String formattedText = String.format(
            "Стадия обновлена!\n\n" +
            "Карточка: *%s*\n" +
            "Перемещение: %s ➔ *%s*\n" +
            "Сумма: *%s ₸*",
            escapeMarkdown(cardTitle),
            escapeMarkdown(fromColumn),
            escapeMarkdown(toColumn),
            dealValue != null ? dealValue.toString() : "0.00"
        );

        sendTelegramMessage(chatId, formattedText);
    }

    private void sendTelegramMessage(String targetChatId, String text) {
        try {
            String url = "https://api.telegram.org/bot" + botToken + "/sendMessage";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> payload = Map.of(
                "chat_id", targetChatId,
                "text", text,
                "parse_mode", "Markdown"
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            restTemplate.postForObject(url, request, String.class);
            log.info("Telegram notification successfully sent to chat {}", targetChatId);
        } catch (Exception e) {
            log.error("Failed to send Telegram notification: {}", e.getMessage());
        }
    }

    private String escapeMarkdown(String text) {
        if (text == null) return "";
        return text.replace("_", "\\_").replace("*", "\\*");
    }
}
```

> [!TIP]
> Обрати внимание на аннотацию `@Async`: отправка сообщения происходит в отдельном фоновом пуле потоков. Пользователь на фронтенде не ждёт ни одной лишней миллисекунды, пока запрос летит в сервера Telegram.

## 4. Подключение сервиса в CrmCardService

Теперь вызовем уведомление в момент завершения перемещения карточки:

```java
@Transactional
public void moveCard(Long cardId, Long targetColumnId, int newPosition) {
    CrmCard card = cardRepository.findById(cardId)
            .orElseThrow(() -> new ResourceNotFoundException("Card not found: " + cardId));
    
    String oldColumnTitle = card.getColumn().getTitle();
    CrmColumn newColumn = columnRepository.findById(targetColumnId)
            .orElseThrow(() -> new ResourceNotFoundException("Column not found: " + targetColumnId));

    card.setColumn(newColumn);
    card.setPosition(newPosition);
    cardRepository.save(card);

    // Если стадия изменилась — триггерим алерт
    if (!oldColumnTitle.equals(newColumn.getTitle())) {
        notificationService.notifyCardMoved(
            card.getTitle(), 
            oldColumnTitle, 
            newColumn.getTitle(), 
            card.getDealValue()
        );
    }
}
```

## Чек-лист урока

- [ ] Получен персональный или групповой `chat_id` через метод `getUpdates`
- [ ] Реализован `TelegramNotificationService` с поддержкой таймаутов и Markdown-форматирования
- [ ] Метод отправки помечен аннотацией `@Async` для неблокирующей работы
- [ ] Перемещение карточки на фронтенде протестировано с реальным получением алерта на телефоне
- [ ] Переменные окружения `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID` безопасно настроены'
        WHERE course_id = target_course_id AND day_number = 22;
    END IF;
END $$;
