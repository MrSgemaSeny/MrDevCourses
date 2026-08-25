package com.mrdevcourses.config;

import com.mrdevcourses.modules.auth.model.Role;
import com.mrdevcourses.modules.auth.model.User;
import com.mrdevcourses.modules.auth.repository.UserRepository;
import com.mrdevcourses.modules.course.model.Course;
import com.mrdevcourses.modules.course.repository.CourseRepository;
import com.mrdevcourses.modules.lesson.model.Lesson;
import com.mrdevcourses.modules.lesson.repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder {

    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedInitialData() {
        if (courseRepository.count() > 0) {
            log.info("Database already seeded with courses, skipping initial seeding.");
            return;
        }

        log.info("Seeding initial MrDevCourses data...");

        // 1. Admin User
        if (!userRepository.existsByEmail("admin@mrdevcourses.com")) {
            User admin = User.builder()
                    .email("admin@mrdevcourses.com")
                    .name("Mr Developer Admin")
                    .avatarUrl("https://github.com/identicons/mrdev.png")
                    .role(Role.ADMIN)
                    .createdAt(Instant.now())
                    .build();
            userRepository.save(admin);
            log.info("Default admin user created: admin@mrdevcourses.com");
        }

        // 2. Primary Course: Вайбкодинг с нуля
        Course vibeCourse = Course.builder()
                .title("Вайбкодинг: от Новичка до Продукта за 5 недель")
                .description("Практический курс по разработке современных веб-приложений с использованием ИИ, архитектурных протоколов и лучших инженерных практик. 1 день — 1 урок.")
                .slug("vibecoding-zero-to-one")
                .active(true)
                .createdAt(Instant.now())
                .build();
        Course savedCourse = courseRepository.save(vibeCourse);

        // 3. Lessons for Course
        List<Lesson> lessons = List.of(
                Lesson.builder()
                        .course(savedCourse)
                        .title("День 1: Мышление разработчика и настройка окружения")
                        .dayNumber(1)
                        .sortOrder(1)
                        .youtubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
                        .content("### Введение в курс\n\nДобро пожаловать в первый день обучения! Сегодня мы разберем:\n- Как формулировать идеи в инженерные спецификации\n- Настройку редактора кода и терминала\n- Принципы Second Brain и протоколы фиксации контекста")
                        .build(),
                Lesson.builder()
                        .course(savedCourse)
                        .title("День 2: Промпт-инжиниринг и проектирование архитектуры")
                        .dayNumber(2)
                        .sortOrder(2)
                        .youtubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
                        .content("### Промпт-инжиниринг\n\nИзучаем как управлять ИИ-агентами:\n- Разница между базовыми и профессиональными системными инструкциями\n- Паттерн Smart Merge и DTO-структурирование\n- Защита от галлюцинаций в сложных логических задачах")
                        .build(),
                Lesson.builder()
                        .course(savedCourse)
                        .title("День 3: Разработка первого UI на React и Tailwind v4")
                        .dayNumber(3)
                        .sortOrder(3)
                        .youtubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
                        .content("### Frontend Foundations\n\n- Структура Feature-Sliced Design (FSD)\n- Настройка Tailwind CSS v4 с темной эстетикой\n- Компонентный подход и типизация на TypeScript")
                        .build(),
                Lesson.builder()
                        .course(savedCourse)
                        .title("День 4: Бэкенд на Spring Boot 3 и безопасность")
                        .dayNumber(4)
                        .sortOrder(4)
                        .youtubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
                        .content("### Backend & Security\n\n- Архитектура модульного монолита\n- Spring Security 6, Google OAuth2 и JWT в httpOnly cookie\n- Защита от IDOR и безопасность на уровне строк")
                        .build(),
                Lesson.builder()
                        .course(savedCourse)
                        .title("День 5: Деплой, CI/CD и релиз продукта")
                        .dayNumber(5)
                        .sortOrder(5)
                        .youtubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
                        .content("### Production Release\n\n- Настройка GitHub Actions пайплайна\n- Контейнеризация и деплой на Fly.io / Vercel\n- Проверка логов, мониторинг и финальная сдача проекта")
                        .build()
        );

        lessonRepository.saveAll(lessons);
        log.info("Seeded 1 course and {} lessons successfully.", lessons.size());
    }
}
