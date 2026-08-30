package com.mrdev.config;

import com.mrdev.modules.ai.rag.model.GlossaryEmbedding;
import com.mrdev.modules.ai.rag.repository.GlossaryEmbeddingRepository;
import com.mrdev.modules.ai.rag.service.EmbeddingService;
import com.mrdev.modules.ai.rag.service.LessonIngestionService;
import com.mrdev.modules.auth.model.Role;
import com.mrdev.modules.auth.model.User;
import com.mrdev.modules.auth.repository.UserRepository;
import com.mrdev.modules.course.model.Course;
import com.mrdev.modules.course.model.CourseModule;
import com.mrdev.modules.course.repository.CourseModuleRepository;
import com.mrdev.modules.course.repository.CourseRepository;
import com.mrdev.modules.lesson.model.Lesson;
import com.mrdev.modules.lesson.model.LessonMaterial;
import com.mrdev.modules.lesson.model.LessonType;
import com.mrdev.modules.lesson.model.MaterialType;
import com.mrdev.modules.lesson.repository.LessonMaterialRepository;
import com.mrdev.modules.lesson.repository.LessonRepository;
import com.mrdev.modules.quiz.model.QuestionType;
import com.mrdev.modules.quiz.model.Quiz;
import com.mrdev.modules.quiz.model.QuizQuestion;
import com.mrdev.modules.quiz.model.QuizQuestionOption;
import com.mrdev.modules.quiz.repository.QuizQuestionOptionRepository;
import com.mrdev.modules.quiz.repository.QuizQuestionRepository;
import com.mrdev.modules.quiz.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder {

    private final CourseRepository courseRepository;
    private final CourseModuleRepository courseModuleRepository;
    private final LessonRepository lessonRepository;
    private final LessonMaterialRepository lessonMaterialRepository;
    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final QuizQuestionOptionRepository quizQuestionOptionRepository;
    private final UserRepository userRepository;
    private final GlossaryEmbeddingRepository glossaryEmbeddingRepository;
    private final LessonIngestionService lessonIngestionService;
    private final EmbeddingService embeddingService;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedInitialData() {
        // Elevate mrsgemaseny to ADMIN if present
        userRepository.findAll().forEach(u -> {
            if (u.getEmail() != null && (u.getEmail().toLowerCase().contains("mrsgemaseny") || u.getEmail().equalsIgnoreCase("orkathebestt@gmail.com"))) {
                if (u.getRole() != Role.ADMIN) {
                    u.setRole(Role.ADMIN);
                    userRepository.save(u);
                    log.info("Elevated user {} to ADMIN role.", u.getEmail());
                }
            }
        });

        if (courseRepository.count() > 0) {
            log.info("Database already seeded with courses, skipping initial seeding.");
            return;
        }

        log.info("Seeding initial MrDeveloper data with domain hierarchy, modules & quizzes...");

        // 1. Admin User
        if (!userRepository.existsByEmail("admin@mrdev.com")) {
            User admin = User.builder()
                    .email("admin@mrdev.com")
                    .name("Mr Developer Admin")
                    .avatarUrl("https://github.com/identicons/mrdev.png")
                    .role(Role.ADMIN)
                    .createdAt(Instant.now())
                    .build();
            userRepository.save(admin);
            log.info("Default admin user created: admin@mrdev.com");
        }

        // 2. Primary Course: MrDeveloper
        Course vibeCourse = Course.builder()
                .title("MrDeveloper")
                .description("Практический курс по разработке современных веб-приложений с использованием ИИ, архитектурных протоколов и лучших инженерных практик. 5 модулей, 30 уроков.")
                .slug("mrdeveloper")
                .active(true)
                .createdAt(Instant.now())
                .build();
        Course savedCourse = courseRepository.save(vibeCourse);

        // 3. Course Modules (5 modules / 5 weeks)
        CourseModule module1 = CourseModule.builder()
                .course(savedCourse)
                .title("Неделя 1: Введение в Вайбкодинг и Быстрый Старт")
                .description("Мягкий вход: что такое вайбкодинг, работа с ИИ, лендинг, GitHub с нуля, MVP-фронтенд и бизнес-планирование.")
                .sortOrder(1)
                .isFreePreview(true)
                .build();

        CourseModule module2 = CourseModule.builder()
                .course(savedCourse)
                .title("Неделя 2: Фронтенд, FSD и Пет-проект «Маркетплейс»")
                .description("Что такое фронтенд, архитектура FSD, дизайн и разработка полноценного пет-проекта маркетплейса.")
                .sortOrder(2)
                .isFreePreview(false)
                .build();

        CourseModule module3 = CourseModule.builder()
                .course(savedCourse)
                .title("Неделя 3: Фулстек, Three.js и Пет-проект «Трекер денег»")
                .description("Архитектура Бэкенд + Фронтенд + БД, 3D визуал на Three.js, реализация логики и тестирование.")
                .sortOrder(3)
                .isFreePreview(false)
                .build();

        CourseModule module4 = CourseModule.builder()
                .course(savedCourse)
                .title("Неделя 4: Сложные интерфейсы: Trello + Second Brain")
                .description("Интерактивные канбан-доски, стейт-менеджмент, протоколы Second Brain и системное мышление.")
                .sortOrder(4)
                .isFreePreview(false)
                .build();

        CourseModule module5 = CourseModule.builder()
                .course(savedCourse)
                .title("Неделя 5: Финальный Проект: Pensee (Всё в одном) & Релиз")
                .description("Разработка супераппа Pensee, CI/CD, облачный деплой, финальная защита и получение сертификата.")
                .sortOrder(5)
                .isFreePreview(false)
                .build();

        List<CourseModule> savedModules = courseModuleRepository.saveAll(List.of(module1, module2, module3, module4, module5));

        // 4. Glossary terms for course
        List<GlossaryEmbedding> terms = List.of(
                createGlossaryEmbedding(savedCourse.getId(), "Вайбкодинг", "AI", "Подход к разработке ПО, где разработчик управляет архитектурой и логикой через ИИ-агентов и системные протоколы."),
                createGlossaryEmbedding(savedCourse.getId(), "FSD", "Frontend", "Feature-Sliced Design — архитектурная методология для фронтенда с разделением на app, pages, widgets, features, entities, shared."),
                createGlossaryEmbedding(savedCourse.getId(), "Three.js", "Frontend", "Библиотека для создания интерактивной 3D-графики в браузере с использованием WebGL."),
                createGlossaryEmbedding(savedCourse.getId(), "Second Brain", "Architecture", "Методология организации цифровой базы знаний для структурирования контекста, решений и проектов."),
                createGlossaryEmbedding(savedCourse.getId(), "Pensee", "Architecture", "Финальный выпускной пет-проект супераппа «Всё в одном» (задачи, финансы, база знаний, AI).")
        );
        glossaryEmbeddingRepository.saveAll(terms);

        // 5. Lessons for Course (30 lessons, 6 per module / 1 week = 6 lessons)
        List<Lesson> lessonsToSave = new ArrayList<>();

        // Module 1 / Неделя 1 (Lessons 1-6)
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(0), "Что такое Вайбкодинг", 1, LessonType.VIDEO, 20, true,
                "### Урок 1: Что такое Вайбкодинг\nМягкий старт: концепция вайбкодинга, как эффективно думать и кодить в связке с ИИ."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(0), "Внедрение в ИИ, лендинг, промпт инжиниринг", 2, LessonType.VIDEO, 25, true,
                "### Урок 2: Внедрение в ИИ\nБыстрое создание первого лендинга, основы промпт-инжиниринга и структурирования запросов к LLM."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(0), "GitHub с нуля. Pages. Коммиты.", 3, LessonType.ARTICLE, 20, true,
                "### Урок 3: GitHub с нуля\nБазовый Git: создание репозитория, первые коммиты, публикация лендинга на GitHub Pages."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(0), "Структура проекта. MVP-фронтенд.", 4, LessonType.VIDEO, 30, false,
                "### Урок 4: Структура проекта\nОрганизация файлов простого веб-приложения, быстрый сбор первого интерактивного MVP."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(0), "Бизнес идея, полный разбор. Планирование.", 5, LessonType.PRACTICE, 45, false,
                "### Урок 5: Сложный практикум\nГлубокий разбор бизнес-идеи, составление спецификации проекта и сдача первого плана на AI-ревью."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(0), "Инженерный дайджест: Лайфхаки вайбкодинга и квиз", 6, LessonType.QUIZ, 15, false,
                "### Урок 6: Итоги 1-й недели\nИнформационный обзор частых ошибок новичков, полезные инструменты и легкий проверочный квиз."));

        // Module 2 / Неделя 2 (Lessons 7-12)
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(1), "Что такое фронтенд. FSD. Теория.", 7, LessonType.VIDEO, 30, false,
                "### Урок 7: Что такое фронтенд\nПонятие интерфейса, основы современной FSD (Feature-Sliced Design) методологии."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(1), "Пет проект на фронте — Маркетплейс.", 8, LessonType.VIDEO, 35, false,
                "### Урок 8: Маркетплейс\nПостановка задачи для пет-проекта, каталог товаров, корзина и карточки."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(1), "Полное планирование. Гений архитектуры.", 9, LessonType.ARTICLE, 25, false,
                "### Урок 9: Гений архитектуры\nДекомпозиция слоев FSD: entities (продукт), features (добавление в корзину), widgets (каталог)."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(1), "Реализация идеи. Дизайн.", 10, LessonType.VIDEO, 40, false,
                "### Урок 10: Реализация и дизайн\nСборка интерфейса маркетплейса, адаптивная верстка, анимации и стили."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(1), "Доведение до конца пет-проекта.", 11, LessonType.PRACTICE, 55, false,
                "### Урок 11: Сложный практикум\nЗавершение всей функциональности маркетплейса, полировка деталей и сдача отчета."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(1), "Инженерный дайджест: Разбор маркетплейса, UI-мемы и квиз", 12, LessonType.QUIZ, 15, false,
                "### Урок 12: Итоги 2-й недели\nРазбор типовых ошибок при верстке интернет-магазинов, юмор в IT и квиз."));

        // Module 3 / Неделя 3 (Lessons 13-18)
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(2), "Архитектура проекта. Бэкенд + фронт + БД", 13, LessonType.VIDEO, 35, false,
                "### Урок 13: Фулстек архитектура\nКак соединяются интерфейс, серверное API и база данных PostgreSQL."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(2), "Трекер денег. Планирование.", 14, LessonType.VIDEO, 30, false,
                "### Урок 14: Трекер денег\nСпецификация пет-проекта учета финансов: транзакции, категории, баланс и аналитика."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(2), "Реализация. Лендинг. Three.js.", 15, LessonType.VIDEO, 45, false,
                "### Урок 15: Three.js визуал\nСоздание промо-лендинга для Трекера денег с 3D-элементами на Three.js."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(2), "До конца.", 16, LessonType.VIDEO, 40, false,
                "### Урок 16: Доведение логики до конца\nСвязка бэкенда с фронтендом, сохранение транзакций в БД и обновление баланса."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(2), "Тесты.", 17, LessonType.PRACTICE, 50, false,
                "### Урок 17: Сложный практикум\nПокрытие ключевой логики подсчета денег тестами, сдача отчета по надежности."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(2), "Инженерный дайджест: Ошибки в финансовых системах и квиз", 18, LessonType.QUIZ, 15, false,
                "### Урок 18: Итоги 3-й недели\nИнформационный обзор багов округления и транзакций, проверочный квиз."));

        // Module 4 / Неделя 4 (Lessons 19-24)
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(3), "Trello. Испытание.", 19, LessonType.VIDEO, 35, false,
                "### Урок 19: Trello. Испытание\nСтарт пет-проекта канбан-доски: постановка требований к интерактивному drag-and-drop."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(3), "Канбан-архитектура, dnd-kit и стейт-менеджмент", 20, LessonType.VIDEO, 40, false,
                "### Урок 20: dnd-kit на практике\nРеализация перемещения карточек между колонками с мгновенным оптимистичным обновлением."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(3), "Second Brain.", 21, LessonType.ARTICLE, 30, false,
                "### Урок 21: Second Brain\nКонцепция личной базы знаний, организация markdown заметок и zettelkasten связей."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(3), "Интеграция базы знаний и протоколы", 22, LessonType.VIDEO, 40, false,
                "### Урок 22: Интеграция базы знаний\nСвязывание канбан-задач со страницами базы знаний и правилами проекта."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(3), "Урок 5! (Сложный практикум: Защита Trello + Second Brain)", 23, LessonType.PRACTICE, 60, false,
                "### Урок 23: Сложный практикум\nФинальная полировка проекта Trello + Second Brain и сдача отчета на AI-ревью."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(3), "Инженерный дайджест: Инструменты продуктивности и квиз", 24, LessonType.QUIZ, 15, false,
                "### Урок 24: Итоги 4-й недели\nОбзор инструментов разработчика (Obsidian, Notion, Trello) и квиз 4-й недели."));

        // Module 5 / Неделя 5 (Lessons 25-30)
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(4), "Pensee. Всё в одном.", 25, LessonType.VIDEO, 40, false,
                "### Урок 25: Pensee. Всё в одном\nАрхитектура выпускного супераппа Pensee: объединение задач, финансов, заметок и AI."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(4), "Реализация супераппа и подключение AI", 26, LessonType.VIDEO, 45, false,
                "### Урок 26: Pensee Core\nСборка интерфейса, подключение AI-наставника и интеграция базы данных."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(4), "Полировка UI, UX и Three.js анимаций", 27, LessonType.ARTICLE, 30, false,
                "### Урок 27: UI & UX полировка\nСведение всех компонентов в единую темную дизайн-систему, адаптивность и плавность."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(4), "CI/CD и облачный деплой (Fly.io + Vercel)", 28, LessonType.VIDEO, 45, false,
                "### Урок 28: Деплой в облако\nАвтоматическая сборка, GitHub Actions, деплой бэкенда на Fly.io и фронтенда на Vercel."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(4), "Выпускной практикум: Защита проекта и сводный отчет", 29, LessonType.PRACTICE, 60, false,
                "### Урок 29: Сложный выпускной практикум\nФинальная сдача проекта Pensee, прохождение полного чек-листа и защита отчета."));
        lessonsToSave.add(buildLesson(savedCourse, savedModules.get(4), "Финишная прямая: Торжественное завершение и сертификат", 30, LessonType.QUIZ, 20, false,
                "### Урок 30: Выпускной\nПодведение итогов 5 недель, генерация именного диплома и дальнейшие шаги разработчика."));



        List<Lesson> savedLessons = lessonRepository.saveAll(lessonsToSave);
        log.info("Seeded 1 course, 5 modules and {} lessons successfully.", savedLessons.size());

        // 6. Seed Materials
        LessonMaterial mat1 = LessonMaterial.builder()
                .lesson(savedLessons.get(0))
                .title("Шпаргалка: Архитектура FSD и правила именования")
                .materialType(MaterialType.CHEAT_SHEET)
                .url("https://feature-sliced.design/docs/get-started/overview")
                .sortOrder(1)
                .build();
        LessonMaterial mat2 = LessonMaterial.builder()
                .lesson(savedLessons.get(0))
                .title("Исходный код: Шаблон репозитория MrDeveloper")
                .materialType(MaterialType.REPO_LINK)
                .url("https://github.com/MrSgemaSeny/MrDeveloper")
                .sortOrder(2)
                .build();
        lessonMaterialRepository.saveAll(List.of(mat1, mat2));

        // 7. Seed Quizzes for quiz lessons (Lesson 5, 11, 17, 23, 29)
        Quiz quiz23 = Quiz.builder()
                .lesson(savedLessons.get(22))
                .title("Аттестация: Spring Security 6, JWT и Transactional Outbox")
                .description("Проверьте свои знания по защите REST API и надежной доставке событий.")
                .passingScorePercentage(80)
                .maxAttempts(5)
                .timeLimitSeconds(600)
                .build();
        Quiz savedQuiz = quizRepository.save(quiz23);

        QuizQuestion q1 = QuizQuestion.builder()
                .quiz(savedQuiz)
                .questionText("Где наиболее безопасно хранить JWT-токен на стороне браузера для защиты от XSS-атак?")
                .questionType(QuestionType.SINGLE_CHOICE)
                .points(1)
                .sortOrder(1)
                .explanation("httpOnly cookie недоступны для JavaScript, что предотвращает их кражу вредоносными скриптами при XSS уязвимостях.")
                .build();
        QuizQuestion savedQ1 = quizQuestionRepository.save(q1);

        QuizQuestionOption opt1_1 = QuizQuestionOption.builder().question(savedQ1).optionText("В localStorage").isCorrect(false).sortOrder(1).build();
        QuizQuestionOption opt1_2 = QuizQuestionOption.builder().question(savedQ1).optionText("В защищенной httpOnly cookie").isCorrect(true).sortOrder(2).build();
        QuizQuestionOption opt1_3 = QuizQuestionOption.builder().question(savedQ1).optionText("В sessionStorage").isCorrect(false).sortOrder(3).build();
        quizQuestionOptionRepository.saveAll(List.of(opt1_1, opt1_2, opt1_3));

        QuizQuestion q2 = QuizQuestion.builder()
                .quiz(savedQuiz)
                .questionText("Какую проблему решает архитектурный паттерн Transactional Outbox?")
                .questionType(QuestionType.SINGLE_CHOICE)
                .points(1)
                .sortOrder(2)
                .explanation("Паттерн Transactional Outbox гарантирует надежную доставку событий во внешние системы без потери данных при сбоях JVM.")
                .build();
        QuizQuestion savedQ2 = quizQuestionRepository.save(q2);

        QuizQuestionOption opt2_1 = QuizQuestionOption.builder().question(savedQ2).optionText("Ускоряет выполнение SQL-запросов SELECT").isCorrect(false).sortOrder(1).build();
        QuizQuestionOption opt2_2 = QuizQuestionOption.builder().question(savedQ2).optionText("Гарантирует надежную публикацию событий вместе с транзакцией БД").isCorrect(true).sortOrder(2).build();
        QuizQuestionOption opt2_3 = QuizQuestionOption.builder().question(savedQ2).optionText("Заменяет реляционную базу данных").isCorrect(false).sortOrder(3).build();
        quizQuestionOptionRepository.saveAll(List.of(opt2_1, opt2_2, opt2_3));

        // 8. Vector ingestion for all seeded lessons
        for (Lesson l : savedLessons) {
            lessonIngestionService.ingestLesson(l);
        }
        log.info("Vector ingestion and Quiz seeding completed successfully.");
    }

    private Lesson buildLesson(Course course, CourseModule module, String title, int dayNumber,
                               LessonType type, int durationMinutes, boolean isFree, String content) {
        return Lesson.builder()
                .course(course)
                .module(module)
                .title(title)
                .dayNumber(dayNumber)
                .sortOrder(dayNumber)
                .lessonType(type)
                .durationMinutes(durationMinutes)
                .isFreePreview(isFree)
                .youtubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
                .content(content)
                .build();
    }

    private GlossaryEmbedding createGlossaryEmbedding(Long courseId, String term, String category, String definition) {
        float[] vec = embeddingService.generateEmbedding(term + ": " + definition);
        return GlossaryEmbedding.builder()
                .courseId(courseId)
                .term(term)
                .category(category)
                .definition(definition)
                .embedding(embeddingService.vectorToString(vec))
                .build();
    }
}
