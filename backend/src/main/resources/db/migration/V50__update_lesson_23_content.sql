-- MrDevCourses: Migration V50 - Update Lesson 23 Full Content
-- Lesson 23: Code review + CI/CD pipeline: GitHub Actions, деплой на Vercel (фронт) и Render (бэк)

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
        SET title = 'Code review + CI/CD pipeline: GitHub Actions, деплой на Vercel (фронт) и Render (бэк)',
            content = '# Урок 23: Автоматизация CI/CD через GitHub Actions и Production Деплой CRM

Профессиональные разработчики никогда не собирают проект вручную на своём ноутбуке и не загружают файлы на сервер через FTP. Любое ручное действие — это гарантированная ошибка человека: забыл запустить тесты, залил не ту версию, случайно затёр пароли. В этом уроке мы построим настоящий промышленный CI/CD пайплайн в GitHub Actions: автоматические quality gates (проверка тестов, сборка, линтинг) и автоматический релиз на Vercel и Render при каждом коммите.

## 1. Что такое CI/CD: две опоры надёжного релиза

- **CI (Continuous Integration — Непрерывная интеграция)**:
  Каждый раз, когда ты или кто-то из команды открывает Pull Request или делает `git push`, облачный сервер GitHub мгновенно запускает чистую виртуальную машину Ubuntu, скачивает твой код и прогоняет полный набор проверок: компилирует Java, запускает тесты JUnit, проверяет типы в TypeScript и собирает фронтенд. Если хотя бы один тест упал — билд бракуется, и плохой код физически не может попасть на рабочий сервер.
- **CD (Continuous Deployment — Непрерывная доставка)**:
  Если все тесты зелёные — GitHub Actions сам вызывает вебхуки облачных платформ (Render и Vercel) и обновляет приложение в интернете без секунды простоя (Zero-Downtime Deployment).

> [!NOTE]
> Принцип "Зелёного мастера": ветка `main` в твоём репозитории ВСЕГДА должна находиться в рабочем состоянии. Любой коммит в `main` должен автоматически проходить все проверки.

## 2. Комплексный пайплайн GitHub Actions для монорепозитория (`.github/workflows/ci-cd.yml`)

В нашем проекте бэкенд и фронтенд живут в одном репозитории (монорепа: `backend/` и `frontend/`). Создадим единый workflow с параллельным запуском двух независимых проверок:

```yaml
name: CRM Production CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  # -------------------------------------------------------------
  # Quality Gate 1: Backend (Java 17, Gradle, JUnit 5)
  # -------------------------------------------------------------
  backend-gate:
    name: Backend Test & Build
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./backend

    steps:
      - name: 1. Клонируем репозиторий
        uses: actions/checkout@v4

      - name: 2. Настраиваем JDK 17 (Temurin)
        uses: actions/setup-java@v4
        with:
          java-version: 17
          distribution: ''temurin''
          cache: ''gradle''

      - name: 3. Даём права на запуск gradlew
        run: chmod +x ./gradlew

      - name: 4. Запускаем тесты JUnit 5 и сборку JAR
        run: ./gradlew test bootJar --no-daemon

      - name: 5. Сохраняем отчёт о тестах
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: junit-test-results
          path: backend/build/reports/tests/test/

  # -------------------------------------------------------------
  # Quality Gate 2: Frontend (React 19, TypeScript, Vitest)
  # -------------------------------------------------------------
  frontend-gate:
    name: Frontend Typecheck & Build
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./frontend

    steps:
      - name: 1. Клонируем репозиторий
        uses: actions/checkout@v4

      - name: 2. Настраиваем Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: ''npm''
          cache-dependency-path: ./frontend/package-lock.json

      - name: 3. Устанавливаем чистые зависимости
        run: npm ci

      - name: 4. Запускаем строгую проверку типов TypeScript
        run: npx tsc --noEmit

      - name: 5. Запускаем тесты Vitest
        run: npm test -- --run

      - name: 6. Собираем production-бандл
        run: npm run build

  # -------------------------------------------------------------
  # Stage 3: Деплой при успехе проверок (только для ветки main)
  # -------------------------------------------------------------
  deploy-trigger:
    name: Trigger Cloud Deployments
    needs: [ backend-gate, frontend-gate ]
    if: github.ref == ''refs/heads/main'' && github.event_name == ''push''
    runs-on: ubuntu-latest
    steps:
      - name: Вызов Deploy Hook для Render (Бэкенд)
        if: env.RENDER_HOOK != ''''
        env:
          RENDER_HOOK: ${{ secrets.RENDER_DEPLOY_HOOK }}
        run: |
          curl -X POST "$RENDER_HOOK"

      - name: Вызов Deploy Hook для Vercel (Фронтенд)
        if: env.VERCEL_HOOK != ''''
        env:
          VERCEL_HOOK: ${{ secrets.VERCEL_DEPLOY_HOOK }}
        run: |
          curl -X POST "$VERCEL_HOOK"
```

## 3. Настройка GitHub Secrets

Секретные ключи (токены ботов, пароли от базы, вебхуки хостинга) **НИКОГДА** нельзя коммитить в код. Их место — в защищённом хранилище GitHub Secrets:

1. В своём репозитории перейди в **Settings** -> **Secrets and variables** -> **Actions**.
2. Нажми **New repository secret**.
3. Создай секреты:
   - `RENDER_DEPLOY_HOOK`: URL вебхука из панели Render (Settings -> Deploy Hook).
   - `VERCEL_DEPLOY_HOOK`: URL вебхука из панели Vercel (Settings -> Git -> Deploy Hooks).

Теперь GitHub Actions безопасно задеплоит новую версию приложения сразу после успешного прохождения всех тестов!

## 4. Как действовать, если CI упал с красным крестиком

Когда ты видишь красный крестик в GitHub Actions — не паникуй. Это твой друг, спасший тебя от падения продакшена:
1. Кликни на упавший шаг в интерфейсе GitHub.
2. Прочитай последние 10 строк лога.
3. Если ошибка в `Backend`: посмотри название упавшего теста (например, `moveCard_shouldUpdatePosition() FAILED`). Запусти `./gradlew test` локально и исправь баг.
4. Если ошибка во `Frontend`: посмотри ошибку TypeScript компилятора (например, `Property ''priority'' is missing in type`). Исправь типизацию и сделай новый `git push`.

## Чек-лист урока

- [ ] Создан файл `.github/workflows/ci-cd.yml` с параллельными гейтами для бэкенда и фронтенда
- [ ] Настроена строгая проверка TypeScript `tsc --noEmit` и прогон тестов
- [ ] Настроены безопасные Deploy Hooks через GitHub Secrets
- [ ] Пайплайн успешно протестирован и выдал зелёный статус на GitHub'
        WHERE course_id = target_course_id AND day_number = 23;
    END IF;
END $$;
