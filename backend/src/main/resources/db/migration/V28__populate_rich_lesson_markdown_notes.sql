-- MrDevCourses: Migration V28 - Populate Rich Markdown Lesson Notes
-- Provides formatted markdown notes with headers, code blocks, checklists, and callouts

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

        -- Урок 1
        UPDATE lessons SET content = 
'# Неделя 1 • Урок 1: Вайбкодинг как методология

> [!NOTE]
> Вайбкодинг — это не слепое копирование кода из чата, а архитектурное управление искусственным интеллектом, где разработчик выступает в роли тимлида/архитектора, а нейросеть — в роли высокоскоростного исполнителя.

## Цели урока
- Понять разницу между классическим подходом и AI-driven разработкой.
- Изучить ключевые правила эффективного диалога с LLM (Claude, ChatGPT, Gemini).
- Настроить мышление: от ручного набора символов к декомпозиции и валидации.

## Главные принципы
- **Архитектурный контроль**: Всегда понимай, какую архитектуру ты строишь, прежде чем просить сгенерировать файл.
- **Итеративность**: Не генерируй весь проект одним промптом. Двигайся маленькими верифицируемыми шагами.
- **Быстрая обратная связь**: Запусти код сразу после генерации, проверь логи в консоли браузера и терминале.

```bash
# Проверка готовности окружения
node -v
git --version
```'
        WHERE course_id = target_course_id AND day_number = 1;

        -- Урок 2
        UPDATE lessons SET content = 
'# Неделя 1 • Урок 2: Настройка рабочего окружения и промпт-инжиниринг

> [!TIP]
> Качественный системный промпт экономит до 80% времени на исправление галлюцинаций нейросети.

## Установка инструментов
1. **Редактор кода**: VS Code или Cursor.
2. **AI-инструменты**: Antigravity, Claude Desktop, ChatGPT, Gemini.
3. **Контроль версий**: Git CLI.

## Шаблон системного промпта
```markdown
Ты — Senior Full-Stack Architect.
Твоя задача — писать чистый, модульный код на React 19, TypeScript и Spring Boot 3.
Правила:
- Строгая типизация без `any`.
- Архитектурное разделение слоев.
- Никаких неиспользуемых зависимостей.
```

## Чеклист проверки
- [x] Редактор установлен и настроен
- [x] Git инициализирован в терминале
- [x] Сформулирован первый системный промпт'
        WHERE course_id = target_course_id AND day_number = 2;

        -- Урок 3
        UPDATE lessons SET content = 
'# Неделя 1 • Урок 3: GitHub с нуля: репозитории, коммиты, ветки и деплой

> [!IMPORTANT]
> Никогда не коммить пароли, токены и приватные ключи в открытые репозитории. Используй `.env` и `.gitignore`.

## Основные команды Git
```bash
# Инициализация и первый коммит
git init
git add .
git commit -m "feat: initial commit"

# Привязка удаленного репозитория и push
git remote add origin https://github.com/username/project.git
git branch -M main
git push -u origin main
```

## Пошаговый процесс сдачи ДЗ
1. Создать репозиторий на GitHub.
2. Запушить локальный код.
3. Включить GitHub Pages в настройках репозитория (Settings -> Pages -> Branch: main).
4. Скопировать ссылки на репозиторий и демо-сайт в форму сдачи.'
        WHERE course_id = target_course_id AND day_number = 3;

        -- Урок 4
        UPDATE lessons SET content = 
'# Неделя 1 • Урок 4: Структура проекта и MVP фронтенда (HTML/CSS/JS)

> [!NOTE]
> Одностраничный лендинг — идеальный полигон для отработки верстки Glassmorphism и мобильной адаптивности.

## Архитектура страницы
- `Header`: логотип, навигация, кнопка действия.
- `Hero Section`: цепляющий оффер, фоновое размытие, CTA-кнопка.
- `Features`: карточки преимуществ в стиле темного стекла.
- `Footer`: контакты и копирайт.

```css
/* Glassmorphism эффект */
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}
```'
        WHERE course_id = target_course_id AND day_number = 4;

        -- Урок 7 (Неделя 2 Урок 1)
        UPDATE lessons SET content = 
'# Неделя 2 • Урок 1: Что такое современный фронтенд. React 19 и FSD Архитектура

> [!NOTE]
> Feature-Sliced Design (FSD) делит фронтенд на понятные слои: `app`, `pages`, `widgets`, `features`, `entities`, `shared`.

## Почему React 19 и TypeScript
- Декларативный UI: интерфейс как функция от данных `UI = f(state)`.
- Строгая типизация интерфейсов через `TypeScript` исключает рантайм ошибки `undefined is not a function`.
- Vite как современный и быстрый сборщик с мгновенным HMR.

```tsx
interface UserCardProps {
  name: string;
  role: "STUDENT" | "ADMIN";
}

export const UserCard: React.FC<UserCardProps> = ({ name, role }) => {
  return (
    <div className="p-4 rounded bg-[#141418] border border-white/10">
      <h3 className="text-white font-bold">{name}</h3>
      <span className="text-xs font-mono text-zinc-400">{role}</span>
    </div>
  );
};
```'
        WHERE course_id = target_course_id AND day_number = 7;

        -- Урок 13 (Неделя 3 Урок 1)
        UPDATE lessons SET content = 
'# Неделя 3 • Урок 1: Архитектура: Бэкенд + Фронтенд + База данных

> [!IMPORTANT]
> Бэкенд отвечает за бизнес-логику, безопасность и персистентность данных. Фронтенд никогда не обращается напрямую к базе данных.

## Трехслойная архитектура Spring Boot 3
1. **Controller (`@RestController`)**: Принимает HTTP запросы, валидирует DTO, возвращает `ResponseEntity`.
2. **Service (`@Service`)**: Содержит бизнес-логику, управляет транзакциями (`@Transactional`).
3. **Repository (`@Repository`)**: Слой доступа к данным через Spring Data JPA / Hibernate.

```java
@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
public class CourseController {
    private final CourseService courseService;

    @GetMapping
    public ResponseEntity<List<CourseDto>> getCourses() {
        return ResponseEntity.ok(courseService.getAllActiveCourses());
    }
}
```'
        WHERE course_id = target_course_id AND day_number = 13;

    END IF;
END
$$;
