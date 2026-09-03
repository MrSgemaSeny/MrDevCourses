-- MrDevCourses: Migration V56 - Update Lesson 29 Full Content
-- Lesson 29: Google SMTP / Gmail API: отправка транзакционных писем из приложения — подготовка к релизу

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
        SET title = 'Google SMTP / Gmail API: отправка транзакционных писем из приложения — подготовка к релизу',
            content = '# Урок 29: Транзакционные письма и почтовые уведомления через Google SMTP

В реальных приложениях связь с пользователем не ограничивается только браузером. Подтверждение регистрации, ссылка на сброс пароля, еженедельная выписка по расходам, чек об оплате или дайджест завершённых задач — всё это **транзакционные письма (Transactional Emails)**. В этом уроке мы подключим стартер Spring Mail, настроим безопасный доступ через Google SMTP шлюз и научимся отправлять стильные HTML-письма в асинхронном режиме.

## 1. Транзакционные письма против Маркетингового спама: в чём разница

Очень важно разделять два вида писем:
- **Маркетинговые рассылки**: Рекламные акции, скидки, "мы по вам соскучились". Они отправляются сотням тысяч людей через специализированные сервисы (Mailchimp, SendGrid) и часто попадают в папку "Промоакции".
- **Транзакционные письма**: Письма, которые отправляются СТРОГО в ответ на конкретное действие пользователя (зарегистрировался, запросил отчёт, закрыл сделку). Они должны доставляться за 2-3 секунды прямо в папку "Входящие".

Для пет-проектов и MVP первой очереди идеальное и абсолютно бесплатное решение — отправка через официальный SMTP-шлюз твоего личного Google-аккаунта (`smtp.gmail.com`).

## 2. Безопасность: получение App Password в аккаунте Google

Ты не можешь просто указать свой обычный пароль от почты Gmail в файле конфигурации приложения. Google заблокирует такую попытку ради безопасности.

Вместо этого используется **App Password (Пароль приложения)** — специальный 16-значный ключ с ограниченными правами:

1. Открой страницу управления своим аккаунтом: `myaccount.google.com`.
2. Перейди в раздел **Безопасность (Security)**.
3. Убедись, что у тебя включена **Двухэтапная аутентификация (2-Step Verification)**.
4. В строке поиска настроек введи: `Пароли приложений` (или `App Passwords`).
5. В поле названия введи: `Pensee LMS Backend` и нажми **Создать**.
6. Google покажет 16-значный жёлтый код вида: `abcd efgh ijkl mnop`.
7. Скопируй его без пробелов. Это и есть пароль для SMTP!

## 3. Настройка Spring Boot Starter Mail (`application.yml`)

Добавим библиотеку в `build.gradle`:
```groovy
implementation ''org.springframework.boot:spring-boot-starter-mail''
```

Сконфигурируем параметры подключения:
```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${SMTP_USERNAME:your_email@gmail.com}
    password: ${SMTP_PASSWORD:your_16_char_app_password}
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
            required: true
        transport:
          protocol: smtp
```

> [!WARNING]
> Ни в коем случае не коммить пароль приложения в Git! Задавай `SMTP_USERNAME` и `SMTP_PASSWORD` через переменные окружения на Render или в локальном файле `.env`.

## 4. Разработка асинхронного сервиса отправки красивых HTML-писем

Отправка письма по протоколу SMTP занимает от 1 до 3 секунд (установка TLS-соединения, проверка сертификата, передача данных). Если вызывать отправку синхронно прямо в контроллере — пользователь нажмёт кнопку "Зарегистрироваться" и будет 3 секунды смотреть на зависший экран.

Поэтому мы используем аннотацию `@Async`: бэкенд мгновенно возвращает клиенту ответ `200 OK`, а задача отправки письма улетает в фоновый пул потоков:

```java
package com.moneytracker.notification.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationService {

    private static final Logger log = LoggerFactory.getLogger(EmailNotificationService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@mrdeveloper.com}")
    private String senderEmail;

    /**
     * Неблокирующая фоновая отправка отчёта
     */
    @Async
    public void sendFinancialDigest(String recipientEmail, String userName, String statsHtml) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            // Флаг true включает режим multipart для красивой HTML-разметки
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(senderEmail, "Mr Developer Pensee");
            helper.setTo(recipientEmail);
            helper.setSubject("Pensee: Твой финансовый дайджест и статус задач за неделю");

            // Стильный адаптивный тёмный HTML-шаблон
            String htmlContent = 
                "<div style=\"font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #0a0a0c; color: #f4f4f5; padding: 32px; border-radius: 8px; max-width: 600px; margin: 0 auto;\">" +
                "  <div style=\"border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px; margin-bottom: 24px;\">" +
                "    <h1 style=\"font-size: 20px; font-weight: 700; color: #ffffff; margin: 0;\">Pensee Workspace</h1>" +
                "  </div>" +
                "  <p style=\"font-size: 15px; line-height: 1.6; color: #d4d4d8;\">Привет, <strong>" + userName + "</strong>!</p>" +
                "  <p style=\"font-size: 14px; line-height: 1.6; color: #a1a1aa;\">Искусственный интеллект Pensee сформировал твою недельную сводку:</p>" +
                "  <div style=\"background-color: #141418; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 20px; margin: 20px 0;\">" +
                statsHtml +
                "  </div>" +
                "  <p style=\"font-size: 12px; color: #71717a; margin-top: 32px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 16px;\">" +
                "    Это сервисное уведомление образовательной платформы Mr Developer." +
                "  </p>" +
                "</div>";

            helper.setText(htmlContent, true);

            mailSender.send(mimeMessage);
            log.info("Financial digest email successfully sent to {}", recipientEmail);

        } catch (MessagingException e) {
            log.error("Failed to compose or send email to {}: {}", recipientEmail, e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error during email dispatch: {}", e.getMessage());
        }
    }
}
```

Не забудь добавить аннотацию `@EnableAsync` в главном классе конфигурации `MrDevApplication.java`, чтобы Spring активировал фоновую очередь задач.

## Чек-лист урока

- [ ] Включена 2-этапная аутентификация и сгенерирован 16-значный Google App Password
- [ ] Подключен стартер `spring-boot-starter-mail` и настроен `application.yml`
- [ ] Реализован `EmailNotificationService` с красивым монохромным HTML-шаблоном
- [ ] Метод отправки помечен `@Async` для мгновенного отклика API без подвисаний
- [ ] Отправлено первое тестовое письмо и проверено во "Входящих"'
        WHERE course_id = target_course_id AND day_number = 29;
    END IF;
END $$;
