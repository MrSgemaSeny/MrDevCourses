package com.mrdev.modules.automation.service;

import com.mrdev.modules.auth.model.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EmailNotificationService {

    private final JavaMailSender mailSender;
    private final String fromAddress;
    private final String frontendUrl;
    private final String mentorEmail;

    public EmailNotificationService(
            @Autowired(required = false) JavaMailSender mailSender,
            @Value("${app.mail.from-address:no-reply@mrdev.pro}") String fromAddress,
            @Value("${app.frontend-url:http://localhost:5173}") String frontendUrl,
            @Value("${app.mail.mentor-email:mentor@mrdev.pro}") String mentorEmail) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
        this.frontendUrl = frontendUrl;
        this.mentorEmail = mentorEmail;
    }

    @Async
    public void sendWelcomeEmail(User student) {
        if (student == null || student.getEmail() == null || student.getEmail().isBlank()) {
            return;
        }

        String subject = "Добро пожаловать в MrDevCourses!";
        String contentHtml = """
            <p style="color: #c9d1d9; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
                Вы успешно зарегистрировались на платформе <b>MrDevCourses</b>.
            </p>
            <p style="color: #8b949e; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                Вам открыт доступ к образовательным материалам, пошаговым чеклистам настройки рабочего окружения и практическим заданиям.
            </p>
            <div style="background-color: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
                <p style="color: #58a6ff; font-size: 13px; font-weight: 600; margin: 0 0 8px 0; text-transform: uppercase; font-family: monospace;">Рекомендации на старте:</p>
                <ul style="color: #c9d1d9; font-size: 13px; margin: 0; padding-left: 20px; line-height: 1.6;">
                    <li>Пройдите онбординг и проверьте установку необходимых утилит.</li>
                    <li>Подключите Telegram-уведомления в профиле для мгновенной обратной связи от ментора.</li>
                    <li>При любых затруднениях используйте кнопку <b>«Не получается»</b> прямо в уроке.</li>
                </ul>
            </div>
            """;

        String html = buildEmailLayout("Добро пожаловать в MrDevCourses", student.getName(), contentHtml, "Перейти к курсам", frontendUrl + "/courses", student.getEmail());
        sendHtmlEmail(student.getEmail(), subject, html);
    }

    @Async
    public void sendHomeworkReviewedEmail(User student, String courseTitle, String lessonTitle, boolean passed, String mentorFeedback) {
        if (student == null || student.getEmail() == null || student.getEmail().isBlank() || !student.isEmailNotificationsEnabled()) {
            return;
        }

        String statusBadge = passed
                ? "<span style=\"color: #3fb950; font-weight: 700;\">ПРИНЯТО</span>"
                : "<span style=\"color: #f85149; font-weight: 700;\">ТРЕБУЕТСЯ ДОРАБОТКА</span>";

        String subject = "Результат проверки ДЗ: " + lessonTitle + " (" + (passed ? "Принято" : "Доработка") + ")";
        
        String feedbackBlock = (mentorFeedback != null && !mentorFeedback.isBlank())
                ? String.format("""
                    <div style="background-color: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 16px; margin: 16px 0;">
                        <p style="color: #8b949e; font-size: 12px; font-weight: 600; text-transform: uppercase; margin: 0 0 8px 0; font-family: monospace;">Комментарий ментора:</p>
                        <p style="color: #c9d1d9; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">%s</p>
                    </div>
                  """, mentorFeedback)
                : "";

        String contentHtml = String.format("""
            <p style="color: #c9d1d9; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
                Ментор проверил ваше домашнее задание по уроку: <b>%s</b>.
            </p>
            <p style="color: #c9d1d9; font-size: 14px; margin: 0 0 16px 0;">
                Вердикт: %s
            </p>
            %s
            """, lessonTitle, statusBadge, feedbackBlock);

        String html = buildEmailLayout("Проверка домашнего задания", student.getName(), contentHtml, "Открыть урок", frontendUrl + "/dashboard", student.getEmail());
        sendHtmlEmail(student.getEmail(), subject, html);
    }

    @Async
    public void sendLessonUnlockedEmail(User student, String courseTitle, String lessonTitle, int dayNumber) {
        if (student == null || student.getEmail() == null || student.getEmail().isBlank() || !student.isEmailNotificationsEnabled()) {
            return;
        }

        String subject = "Открыт новый урок: День " + dayNumber + " — " + lessonTitle;
        String contentHtml = String.format("""
            <p style="color: #c9d1d9; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
                В курсе <b>%s</b> открылся новый урок:
            </p>
            <div style="background-color: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
                <p style="color: #58a6ff; font-size: 16px; font-weight: 700; margin: 0 0 4px 0;">День %d: %s</p>
                <p style="color: #8b949e; font-size: 13px; margin: 0;">Урок готов к изучению. Все материалы и практические шаги доступны в личном кабинете.</p>
            </div>
            """, courseTitle, dayNumber, lessonTitle);

        String html = buildEmailLayout("Новый урок открыт", student.getName(), contentHtml, "Начать урок", frontendUrl + "/dashboard", student.getEmail());
        sendHtmlEmail(student.getEmail(), subject, html);
    }

    @Async
    public void sendSosMentorAlertEmail(String studentName, String studentEmail, String courseTitle, String lessonTitle, String problemText, String errorLogs) {
        String targetEmail = (mentorEmail != null && !mentorEmail.isBlank()) ? mentorEmail : fromAddress;
        if (targetEmail == null || targetEmail.isBlank()) {
            return;
        }

        String subject = "[SOS Сигнал] " + studentName + " застрял на уроке: " + lessonTitle;
        
        String errorBlock = (errorLogs != null && !errorLogs.isBlank())
                ? String.format("""
                    <div style="background-color: #0d1117; border: 1px solid #da3633; border-radius: 6px; padding: 12px; margin-top: 12px; font-family: monospace; font-size: 12px; color: #ff7b72; overflow-x: auto;">
                        %s
                    </div>
                  """, errorLogs.length() > 600 ? errorLogs.substring(0, 600) + "..." : errorLogs)
                : "";

        String contentHtml = String.format("""
            <p style="color: #f85149; font-size: 15px; font-weight: 700; margin: 0 0 12px 0;">
                Студент нажал кнопку «Не получается» и запросил помощь ментора.
            </p>
            <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="color: #c9d1d9; font-size: 14px; margin-bottom: 16px;">
                <tr><td style="padding: 4px 0; color: #8b949e; width: 100px;">Студент:</td><td><b>%s</b> (%s)</td></tr>
                <tr><td style="padding: 4px 0; color: #8b949e;">Курс:</td><td>%s</td></tr>
                <tr><td style="padding: 4px 0; color: #8b949e;">Урок:</td><td>%s</td></tr>
            </table>
            <div style="background-color: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 14px; margin-bottom: 12px;">
                <p style="color: #8b949e; font-size: 12px; font-weight: 600; text-transform: uppercase; margin: 0 0 6px 0;">Описание проблемы:</p>
                <p style="color: #c9d1d9; font-size: 14px; line-height: 1.5; margin: 0;">%s</p>
            </div>
            %s
            """, studentName, studentEmail, courseTitle, lessonTitle, problemText, errorBlock);

        String html = buildEmailLayout("SOS Сигнал студента", "Ментор", contentHtml, "Открыть админку", frontendUrl + "/admin", targetEmail);
        sendHtmlEmail(targetEmail, subject, html);
    }

    @Async
    public void sendInactivityNudgeEmail(User student, int inactiveDays, String nextLessonTitle) {
        if (student == null || student.getEmail() == null || student.getEmail().isBlank() || !student.isEmailNotificationsEnabled()) {
            return;
        }

        String subject = "Нужна помощь с продолжением обучения на MrDevCourses?";
        String contentHtml = String.format("""
            <p style="color: #c9d1d9; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
                Заметили, что вы не заходили на платформу уже %d дн.
            </p>
            <p style="color: #8b949e; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                Если вы застряли на каком-то шаге или возникла техническая заминка с кодом — не откладывайте! Нажмите кнопку <b>«Не получается»</b> на странице урока, и ментор подключится для разбора.
            </p>
            <div style="background-color: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
                <p style="color: #8b949e; font-size: 12px; font-weight: 600; text-transform: uppercase; margin: 0 0 4px 0; font-family: monospace;">Следующий шаг:</p>
                <p style="color: #58a6ff; font-size: 15px; font-weight: 600; margin: 0;">%s</p>
            </div>
            """, inactiveDays, nextLessonTitle != null ? nextLessonTitle : "Продолжить обучение");

        String html = buildEmailLayout("Продолжить обучение", student.getName(), contentHtml, "Вернуться к урокам", frontendUrl + "/dashboard", student.getEmail());
        sendHtmlEmail(student.getEmail(), subject, html);
    }

    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        if (mailSender == null) {
            log.info("[Mock Mail Sender] Email to {}: Subject='{}'", to, subject);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            mailSender.send(message);
            log.info("Email successfully sent to {}", to);
        } catch (MessagingException e) {
            log.error("Failed to construct/send email to {}: {}", to, e.getMessage());
        } catch (Exception e) {
            log.warn("Mocking email to {} due to mail sender condition: {}", to, e.getMessage());
        }
    }

    private String buildEmailLayout(String headerTitle, String recipientName, String contentHtml, String buttonText, String buttonUrl, String recipientEmail) {
        String buttonSection = "";
        if (buttonText != null && buttonUrl != null && !buttonText.isBlank() && !buttonUrl.isBlank()) {
            buttonSection = String.format("""
                <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0 16px 0;">
                    <tr><td align="center">
                        <a href="%s" style="display: inline-block; background-color: #238636; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;">
                            %s &rarr;
                        </a>
                    </td></tr>
                </table>
            """, buttonUrl, buttonText);
        }

        String displayName = (recipientName != null && !recipientName.isBlank()) ? recipientName : "Студент";

        return String.format("""
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
            <body style="margin: 0; padding: 0; background-color: #0d1117; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; color: #c9d1d9;">
                <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0d1117; padding: 32px 12px;">
                    <tr><td align="center">
                        <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #161b22; border: 1px solid #30363d; border-radius: 8px; overflow: hidden;">
                            <!-- Header -->
                            <tr><td style="padding: 24px 32px; border-bottom: 1px solid #21262d; background-color: #0d1117;">
                                <table width="100%%" border="0" cellspacing="0" cellpadding="0">
                                    <tr>
                                        <td>
                                            <span style="font-size: 18px; font-weight: 700; color: #58a6ff; letter-spacing: -0.3px; font-family: monospace;">MrDev</span>
                                            <span style="font-size: 18px; font-weight: 600; color: #ffffff;">Courses</span>
                                        </td>
                                        <td align="right">
                                            <span style="font-size: 11px; color: #8b949e; text-transform: uppercase; font-family: monospace; letter-spacing: 1px;">LMS Platform</span>
                                        </td>
                                    </tr>
                                </table>
                            </td></tr>
                            <!-- Body -->
                            <tr><td style="padding: 32px;">
                                <h2 style="font-size: 18px; font-weight: 700; color: #ffffff; margin: 0 0 16px 0;">%s</h2>
                                <p style="font-size: 14px; color: #8b949e; margin: 0 0 20px 0;">Здравствуйте, <b style="color: #c9d1d9;">%s</b>!</p>
                                %s
                                %s
                                <!-- Footer -->
                                <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #21262d;">
                                    <tr><td style="text-align: center;">
                                        <p style="font-size: 12px; color: #8b949e; margin: 0 0 8px 0;">С уважением, команда <b>MrDevCourses</b></p>
                                        <p style="font-size: 11px; color: #484f58; margin: 0;">
                                            Это транзакционное сообщение. Вы можете настроить уведомления или 
                                            <a href="%s/unsubscribe" style="color: #58a6ff; text-decoration: none;">отписаться от рассылки</a>.
                                        </p>
                                    </td></tr>
                                </table>
                            </td></tr>
                        </table>
                    </td></tr>
                </table>
            </body>
            </html>
            """, headerTitle, displayName, contentHtml, buttonSection, frontendUrl);
    }
}