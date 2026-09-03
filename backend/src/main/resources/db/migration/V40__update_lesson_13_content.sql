-- MrDevCourses: Migration V40 - Update Lesson 13 Full Content
-- Lesson 13: Системная архитектура: монолит vs микросервисы, выбор стека, ERD базы данных — планировка трекера

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
        SET title = 'Системная архитектура: монолит vs микросервисы, выбор стека, ERD базы данных — планировка трекера',
            content = '# Урок 13: Системная архитектура и Проектирование базы данных — фундамент Full-Stack

Добро пожаловать на третью неделю курса! Мы совершаем качественный скачок на **Уровень 2 (Full-Stack разработка)**. Мы начинаем создавать «Трекер денег» — полноценную финансовую систему с бэкендом на Java 17 и Spring Boot 3, реляционной базой данных PostgreSQL и интерактивной 3D-графикой на Three.js.

В этом уроке мы разберём, как мыслят системные архитекторы: где заканчивается зона ответственности браузера и начинается сервер, почему хранить деньги в базе данных сложнее, чем кажется, и как спроектировать масштабируемую схему реляционных таблиц.

## 1. Клиент-серверная архитектура: где кончается фронтенд и начинается бэкенд

До сих пор мы создавали сайты, которые работали исключительно внутри браузера пользователя. Но в реальном мире хранить финансовые данные в браузере (LocalStorage) категорически нельзя:
- Любой пользователь может открыть консоль браузера (F12) и изменить свой баланс с 1 000 ₸ на 1 000 000 ₸ в одну команду.
- Данные привязаны к одному устройству: если пользователь откроет сайт с телефона, баланс исчезнет.
- Нет гарантии сохранности: при очистке кэша браузера вся история стирается безвозвратно.

Бэкенд — это **доверенная среда (Trusted Environment)**. Он работает на защищённом сервере, проводит строгую валидацию входных данных, рассчитывает балансы и сохраняет историю в надёжной базе данных PostgreSQL.

```
┌────────────────────────┐         HTTPS / JSON          ┌────────────────────────┐          SQL          ┌────────────────────────┐
│  React 19 + TypeScript │ <───────────────────────────> │  Spring Boot 3 (API)   │ <───────────────────> │     PostgreSQL 17      │
│  (Клиентская оболочка) │                               │  (Бизнес-логика, RBAC) │                       │  (Надёжное хранилище)  │
└────────────────────────┘                               └────────────────────────┘                       └────────────────────────┘
```

## 2. Архитектурный выбор: Модульный монолит против Микросервисов

Многие начинающие разработчики думают, что "крутой бэкенд" — это обязательно 10 микросервисов в Docker. Это опасное заблуждение, которое губит 80% молодых стартапов.

Почему для нашего проекта мы выбираем **Модульный монолит (Modular Monolith)**:
1. **Простота развертывания**: Единый исполняемый JAR-файл, один сервер, один открытый порт. Никаких сложных оркестраторов Kubernetes.
2. **ACID-транзакции**: Перевод денег между счетами выполняется в рамках одной атомарной SQL-транзакции. Если во время перевода произошёл сбой — откат (Rollback) происходит мгновенно, и ни один тиын не потеряется. В микросервисах для этого пришлось бы строить сложнейшие саги и распределённые транзакции.
3. **Строгая модульность**: Внутри бэкенда код разделён на независимые Java-пакеты (`auth`, `account`, `transaction`, `analytics`). Если проект вырастет до миллиона пользователей — любой модуль можно вынести в отдельный микросервис за пару дней.

## 3. Проектирование схемы базы данных (ERD)

Для надёжного финансового учета спроектируем реляционную модель данных:

```sql
-- Таблица пользователей
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT ''STUDENT'',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица финансовых счетов (Kaspi Gold, Наличные, Депозит)
CREATE TABLE accounts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT ''KZT'',
    balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица финансовых операций
CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    account_id BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL, -- ''FOOD'', ''SALARY'', ''TECH'', ''TRANSPORT''
    amount NUMERIC(15, 2) NOT NULL,
    type VARCHAR(20) NOT NULL,     -- ''INCOME'', ''EXPENSE'', ''TRANSFER''
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для мгновенной выборки
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
```

> [!IMPORTANT]
> **Золотое правило финансового бэкенда**: Для денежных сумм **НИКОГДА** не используй типы `FLOAT` или `DOUBLE` из-за погрешностей двоичной плавающей точки (в `FLOAT` 0.1 + 0.2 превращается в 0.30000000000000004). В PostgreSQL используется тип `NUMERIC(15, 2)`, а в Java — класс `java.math.BigDecimal`.

## 4. Спецификация REST API контрактов

Зафиксируем список будущих API-эндпоинтов:

- `POST /api/v1/auth/register` — регистрация нового пользователя (email, password) -> получение JWT в cookie
- `POST /api/v1/auth/login` — аутентификация пользователя -> получение JWT в cookie
- `GET /api/v1/accounts` — список всех счетов текущего авторизованного пользователя
- `POST /api/v1/accounts` — создание нового счёта (название, валюта, стартовый баланс)
- `POST /api/v1/transactions` — проведение операции (доход или расход) с атомарным обновлением баланса
- `GET /api/v1/analytics/summary` — агрегированная статистика расходов по категориям за выбранный месяц

## Чек-лист урока

- [ ] Изучена клиент-серверная модель и роль бэкенда как доверенной среды
- [ ] Обоснован выбор архитектуры "Модульный монолит"
- [ ] Спроектированы таблицы `users`, `accounts`, `transactions` с внешними ключами
- [ ] Усвоено правило использования `BigDecimal` и `NUMERIC(15,2)` для денег
- [ ] Описаны эндпоинты REST API для Трекера денег'
        WHERE course_id = target_course_id AND day_number = 13;
    END IF;
END $$;
