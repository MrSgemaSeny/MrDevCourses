-- MrDevCourses: Migration V62 - Update Lesson 8 (Week 2 Lesson 2) AI Prompt-Driven Marketplace Architecture
-- Lesson 8: Старт разработки Маркетплейса: AI-промпты, базовая архитектура и первый запуск

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
        SET title = 'Старт Маркетплейса через AI: пошаговые промпты, структура и первый запуск',
            content = '# Урок 8: Старт разработки Маркетплейса через AI — пошаговые промпты и первый запуск

На прошлом уроке мы разобрали фронтенд-словарь и архитектуру Feature-Sliced Design (FSD). Теперь мы переходим к практике: запускаем настоящее многостраничное SPA-приложение (Single Page Application) — наш **Клиентский Маркетплейс**.

Главное правило вайбкодинга на второй неделе: **ты не пишешь сотни строк шаблонного кода вручную**. Ты выступаешь в роли Senior Tech Lead, который даёт AI-ассистенту (Cursor, Antigravity, Claude Code) выверенные системные промпты, контролирует структуру FSD и пошагово собирает работающий проект.

---

## 1. Базовые термины урока простыми словами

Прежде чем отдавать команды нейросети, зафиксируем 4 ключевых понятия:

```
1. SPA (Single Page Application)
   Приложение, которое загружает HTML один раз. При переходе между страницами браузер не мигает и не перезагружается — React мгновенно подменяет нужный экран.

2. Path Alias (@/)
   Короткий псевдоним пути к папке `src/`. Вместо страшного `../../../../entities/product` мы пишем `@/entities/product`. Код чистый, и файлы можно свободно перемещать.

3. Роутинг (Routing)
   Система дорожных указателей в браузере: адрес `/` показывает главную витрину, адрес `/product/123` — страницу конкретного товара.

4. FSD-срез (Slice)
   Изолированная папка одной бизнес-сущности (например, `entities/product`), в которой лежит всё, что касается товара: типы, внешний вид и публичный шлюз `index.ts`.
```

---

## 2. Шаг 1: Инициализация проекта в терминале

Открой терминал и создай чистый проект на современном сборщике **Vite** с шаблоном **React + TypeScript**:

```bash
# 1. Создаем проект маркетплейса
npm create vite@latest marketplace -- --template react-ts

# 2. Переходим в папку проекта
cd marketplace

# 3. Устанавливаем базовые модули
npm install

# 4. Устанавливаем роутер, иконки и утилиты стилей
npm install react-router-dom lucide-react clsx tailwindcss
```

---

## 3. Шаг 2: AI-Промпт для настройки окружения и Path Aliases

Открой свой AI-ассистент в корне проекта `marketplace` и скорми ему первый системный промпт:

```markdown
Ты — Senior Frontend Architect. Мы разрабатываем клиентский маркетплейс на React 19 + TypeScript + Tailwind CSS по методологии Feature-Sliced Design (FSD).

Задача: Настрой Path Aliases (@/ -> ./src) и базовую конфигурацию стилей.

Выполни следующие изменения:
1. В `vite.config.ts` подключи `@vitejs/plugin-react` и настрой resolve.alias: `@` указывает на папку `./src` через path.resolve.
2. В `tsconfig.app.json` внутри `compilerOptions` добавь `baseUrl: "."` и `"paths": { "@/*": ["src/*"] }`.
3. Создай правильную структуру папок FSD в `src/`:
   - `src/app/` (инициализация, роутер, стили)
   - `src/pages/` (экраны: catalog, product-detail)
   - `src/widgets/` (header, product-grid)
   - `src/features/` (cart, role-switch)
   - `src/entities/` (product, user)
   - `src/shared/` (ui, api, lib)
4. В `src/app/styles/index.css` добавь базовые тёмные стили (#0a0a0c фон, белая типографика).

Сделай изменения чисто и аккуратно.
```

---

## 4. Шаг 3: AI-Промпт для создания сущности Product (FSD Entity)

Теперь делегируем AI создание первой полноценной бизнес-сущности — товара.

Отправь в AI-чат второй промпт:

```markdown
Создай FSD-сущность товара в `src/entities/product/` строго по архитектурному стандарту:

1. `src/entities/product/model/types.ts`:
   - Экспортируй тип `ProductCategory` (''all'' | ''electronics'' | ''clothing'' | ''books'' | ''accessories'').
   - Экспортируй интерфейс `Product` с полями: `id` (string), `title` (string), `description` (string), `price` (number), `category` (ProductCategory), `imageUrl` (string), `rating` (number), `stock` (number).

2. `src/entities/product/ui/ProductCard.tsx`:
   - Создай компонент карточки товара в монохромной тёмной эстетике:
     * Фон карточки: `#141418`, тонкая граница `border border-white/10`, hover:border-zinc-500.
     * Картинка товара с бейджем категории в верхнем углу.
     * Название товара, описание (2 строки max через line-clamp-2).
     * Цена в формате "1 200 ₸" жирным моноширинным шрифтом (`font-mono text-white`).
     * Проп `actionSlot?: React.ReactNode` в правом нижнем углу для будущей кнопки "В корзину".

3. `src/entities/product/index.ts` (Public API):
   - Экспортируй наружу `ProductCard` и типы `Product`, `ProductCategory`.
   - Запрети прямой доступ к внутренним файлам в обход `index.ts`.
```

---

## 5. Шаг 4: AI-Промпт для клиентского роутинга и стартовой витрины

Отправь третий промпт для сборки роутинга и главной страницы каталога:

```markdown
Настрой SPA-роутинг и витрину каталога:

1. Создай моковые данные товаров в `src/entities/product/model/mockProducts.ts` (6 реалистичных товаров с ценами в тенге и качественными Unsplash-ссылками).
2. Создай страницу каталога `src/pages/catalog/ui/CatalogPage.tsx`:
   - Заголовок H1 "Каталог товаров".
   - Адаптивная сетка карточек: 1 колонка на мобилках, 2 на планшетах, 3 на десктопе (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`).
   - Отображение товаров через `ProductCard`.
3. Создай `src/app/router/AppRouter.tsx` на базе `createBrowserRouter` из `react-router-dom`:
   - Маршрут `/` ведет на `CatalogPage`.
   - Экспортируй компонент `AppRouter`.
4. В `src/app/App.tsx` подключи `AppRouter` и оберни в общий тёмный контейнер (`min-h-screen bg-[#0a0a0c] text-white`).
```

---

## 6. Проверка и первый запуск в браузере

Запусти локальный сервер разработки:

```bash
npm run dev
```

Открой в браузере `http://localhost:5173`:
1. На экране отобразилась стильная тёмная сетка товаров маркетплейса.
2. Проверь консоль браузера (F12) — там не должно быть ошибок и предупреждений.
3. Проверь импорты — все компоненты импортируются через `@/entities/product` и `@/pages/catalog` без единого `../../`.

> [!TIP]
> Обрати внимание, насколько вайбкодинг ускоряет работу: вместо 3 часов ручного набора boilerplate-кода и поиска опечаток в путях, ты собрал чистый FSD-каркас за 10 минут, просто управляя контекстом и формулируя точные инженерные промпты для AI.

---

## Чек-лист урока

- [ ] Проект `marketplace` инициализирован на Vite (React 19 + TypeScript)
- [ ] Настроены Path Aliases `@/` в `vite.config.ts` и `tsconfig.app.json`
- [ ] AI сгенерировал FSD-папки (`app`, `pages`, `widgets`, `features`, `entities`, `shared`)
- [ ] Создана сущность `entities/product` со строгими типами и Public API (`index.ts`)
- [ ] Настроен SPA-роутинг на `react-router-dom` и главная страница `CatalogPage`
- [ ] Сервер `npm run dev` успешно запущен на порту 5173, витрина отображается без ошибок

> [!NOTE]
> В следующем уроке мы перейдём к углублению логики: внедрим глобальный стейт-менеджер Zustand, создадим корзину покупок и реализуем двухролевую модель "Покупатель / Продавец".'
        WHERE course_id = target_course_id AND day_number = 8;
    END IF;
END $$;
