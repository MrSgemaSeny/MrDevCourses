-- MrDevCourses: Migration V37 - Update Lesson 10 Full Content
-- Lesson 10: Деплой на GitHub Pages: конфигурация base path, сборка и публикация

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
        SET title = 'Деплой на GitHub Pages: конфигурация base path, сборка и публикация',
            content = '# Урок 10: Профессиональный деплой SPA на GitHub Pages — от кода к живому сервису

Написать работающее приложение на локальном сервере (`localhost`) — это только половина дела. Настоящим разработчиком ты становишься в тот момент, когда твой продукт стабильно работает в интернете по реальной ссылке и открывается на любом устройстве. Сегодня мы разберём, как устроен production-деплой Single Page Application (SPA), почему статические хостинги ломают маршрутизацию и как настроить автоматический релиз через GitHub Actions.

## 1. В чём главная засада при деплое SPA на статический хостинг

Когда ты создавал простой лендинг на первой неделе, всё было примитивно: браузер запрашивал `index.html`, сервер отдавал `index.html`.

Но в React 19 Маркетплейсе всё иначе:
- У нас есть роутер `react-router-dom`.
- Когда пользователь кликает по карточке товара, URL в адресной строке браузера меняется на `https://username.github.io/marketplace/product/123`.
- Браузер не перезагружает страницу: JavaScript просто подменяет компонент каталога на компонент товара.

А теперь представь: пользователь отправил эту ссылку другу или нажал клавишу **F5 (Обновить страницу)**.
Что происходит?
Браузер отправляет реальный HTTP-запрос к серверу GitHub: *"Дай мне файл по пути /marketplace/product/123"*.
Сервер GitHub ищет на диске реальную папку `product` и файл `123`... и, конечно, не находит их!
И пользователь видит уродливую страницу: **404 Not Found**.

> [!IMPORTANT]
> В SPA физически существует только ОДИН HTML-файл — `index.html`. Все остальные страницы и маршруты создаются динамически в памяти браузера с помощью JavaScript.

## 2. Инженерный трюк: как обойти ошибку 404 на GitHub Pages

Чтобы пользователь никогда не видел ошибку 404 при обновлении любой страницы или прямом переходе по ссылке:
На этапе сборки проекта мы копируем собранный `dist/index.html` и сохраняем его точную копию под именем `dist/404.html`.

Когда GitHub Pages не может найти путь `/product/123`, он по умолчанию отдаёт файл `404.html`. А внутри `404.html` загружается наш React Router, который смотрит на текущий URL в строке браузера, понимает, что нужен товар с ID 123, и мгновенно открывает нужный экран!

## 3. Настройка `base` пути в `vite.config.ts`

Когда проект работает локально, он живёт в корне: `http://localhost:5173/`.
Но когда ты публикуешь его на GitHub Pages, он живёт в подпапке с именем репозитория: `https://username.github.io/marketplace/`.

Если не сказать об этом сборщику Vite, браузер попытается загрузить скрипты и стили по адресу `https://username.github.io/assets/index.js` (из корня домена) и получит белый экран.

Настроим относительный или динамический `base` путь в `vite.config.ts`:

```typescript
import { defineConfig } from ''vite'';
import react from ''@vitejs/plugin-react'';
import path from ''path'';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Относительный путь ''./'' гарантирует, что ассеты загрузятся корректно независимо от названия репозитория
  base: ''./'',
  resolve: {
    alias: {
      ''@'': path.resolve(__dirname, ''./src''),
    },
  },
});
```

## 4. Автоматизация CI/CD: пайплайн в GitHub Actions (`.github/workflows/deploy.yml`)

Больше не нужно вручную собирать проект (`npm run build`) и загружать файлы через веб-интерфейс. Мы настроим автоматического робота (GitHub Actions): каждый раз, когда ты делаешь `git push`, робот на сервере GitHub сам скачает код, установит зависимости, соберёт production-билд и опубликует его.

Создай папку и файл в корне проекта: `.github/workflows/deploy.yml`:

```yaml
name: Deploy Marketplace to GitHub Pages

on:
  push:
    branches: [ main ] # Срабатывает при каждом push в ветку main

# Разрешения для записи в GitHub Pages
permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build-and-deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: 1. Клонируем репозиторий
        uses: actions/checkout@v4

      - name: 2. Настраиваем Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: ''npm''

      - name: 3. Устанавливаем зависимости
        run: npm ci

      - name: 4. Собираем проект и создаем 404.html fallback
        run: |
          npm run build
          cp dist/index.html dist/404.html

      - name: 5. Загружаем собранные файлы в артефакты
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

      - name: 6. Деплоим на GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## 5. Включение GitHub Actions в настройках репозитория

1. Зайди в свой репозиторий на GitHub.
2. Нажми вкладку **Settings** -> в левом меню выбери **Pages**.
3. В блоке **Build and deployment** найди выпадающий список **Source** (Источник).
4. Переключи с "Deploy from a branch" на **GitHub Actions**.
5. Теперь сделай коммит и отправь код в репозиторий:

```bash
git add .
git commit -m "ci: configure automated github actions deploy with 404 fallback"
git push origin main
```

6. Перейди во вкладку **Actions** в репозитории на GitHub: ты увидишь, как запустился пайплайн `Deploy Marketplace to GitHub Pages`. Через 40-60 секунд загорится зелёная галочка.
7. Твой Маркетплейс опубликован и готов к работе!

> [!TIP]
> Проверь прямо сейчас: открой сайт, перейди на любой товар и нажми клавишу F5. Страница обновится чисто и без единой ошибки.

## Чек-лист урока

- [ ] Настроен относительный путь `base: ''./''` в `vite.config.ts`
- [ ] Разобрана проблема потери маршрутов в SPA на статических хостингах
- [ ] Создан workflow-файл `.github/workflows/deploy.yml` с автоматическим созданием `404.html`
- [ ] В настройках репозитория Pages переключен источник на GitHub Actions
- [ ] Пайплайн успешно завершился зелёным статусом
- [ ] Работа роутинга и обновление по F5 проверены на живом сайте'
        WHERE course_id = target_course_id AND day_number = 10;
    END IF;
END $$;
