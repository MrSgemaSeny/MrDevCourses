-- MrDevCourses: Migration V47 - Update Lesson 20 Full Content
-- Lesson 20: Технический foundation: README по стандарту, углублённый Second Brain, финализация tech stack

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
        SET title = 'Технический foundation: README по стандарту, углублённый Second Brain, финализация tech stack',
            content = '# Урок 20: Инженерный фундамент CRM, Схема БД и Optimistic Updates

В этом уроке мы заложим надёжную базу для CRM-системы: создадим схему реляционных таблиц в PostgreSQL с каскадным удалением и индексами, зарегистрируем собственного Telegram-бота через официального @BotFather и разберём ключевой паттерн современного интерфейса — **Optimistic UI Updates (Оптимистичные обновления)**.

## 1. Схема базы данных CRM: доски, колонки и карточки

В Kanban-доске существует строгая иерархия:
Пользователь владеет **Досками** (`crm_boards`).
Каждая доска содержит **Колонки** (`crm_columns`), упорядоченные по полю `position`.
Каждая колонка содержит **Карточки** (`crm_cards`), также упорядоченные по полю `position`.

Напишем Flyway-миграцию:

```sql
-- 1. Таблица досок
CREATE TABLE crm_boards (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    owner_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Таблица колонок (стадий)
CREATE TABLE crm_columns (
    id BIGSERIAL PRIMARY KEY,
    board_id BIGINT NOT NULL REFERENCES crm_boards(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    position INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Таблица карточек задач и сделок
CREATE TABLE crm_cards (
    id BIGSERIAL PRIMARY KEY,
    column_id BIGINT NOT NULL REFERENCES crm_columns(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(50) NOT NULL DEFAULT ''MEDIUM'', -- LOW, MEDIUM, HIGH, URGENT
    deal_value NUMERIC(15, 2) DEFAULT 0.00,
    position INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для мгновенной выборки и сортировки карточек
CREATE INDEX idx_crm_columns_board ON crm_columns(board_id, position);
CREATE INDEX idx_crm_cards_column ON crm_cards(column_id, position);
```

> [!IMPORTANT]
> Обрати внимание на `ON DELETE CASCADE`: если пользователь удалит доску, все её колонки и карточки удалятся автоматически. В базе не останется "осиротевших" записей.

## 2. Что такое Optimistic UI Updates и почему без них интерфейс кажется медленным

Представь, как работает обычный сайт:
1. Пользователь перетаскивает карточку в другую колонку и отпускает мышку.
2. Интерфейс блокируется и показывает крутящийся спиннер загрузки.
3. Проходит 300-500 миллисекунд, пока запрос долетит до сервера в США и вернётся ответ.
4. Спиннер исчезает, карточка наконец падает в новую колонку.

Такой интерфейс раздражает: он кажется вязким, тягучим и медленным.

Как работает современный **Optimistic UI**:
1. Пользователь отпускает карточку — и интерфейс **мгновенно, за 0 миллисекунд** переносит карточку в новую колонку на экране. Пользователь уже продолжает работать дальше.
2. В фоне React незаметно отправляет HTTP PATCH запрос на сервер.
3. В 99.9% случаев сервер подтверждает сохранение.
4. Если вдруг произошла ошибка (пропал интернет или сервер упал), React автоматически откатывает карточку на старое место и показывает вежливое предупреждение: *"Не удалось сохранить, изменения отменены"*.

## 3. Реализация Optimistic Update в TanStack React Query

В TanStack Query этот паттерн реализуется тремя функциями: `onMutate`, `onError`, `onSettled`:

```typescript
import { useMutation, useQueryClient } from ''@tanstack/react-query'';

interface MoveCardPayload {
  cardId: number;
  targetColumnId: number;
  newPosition: number;
}

export const useMoveCardMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: MoveCardPayload) => {
      const response = await fetch(`/api/v1/crm/cards/${payload.cardId}/move`, {
        method: ''PATCH'',
        headers: { ''Content-Type'': ''application/json'' },
        body: JSON.stringify({
          targetColumnId: payload.targetColumnId,
          newPosition: payload.newPosition,
        }),
      });
      if (!response.ok) throw new Error(''Server update failed'');
      return response.json();
    },

    // 1. Срабатывает ДО отправки запроса на сервер
    onMutate: async (newMove) => {
      // Отменяем любые исходящие запросы доски, чтобы они не перезаписали наш оптимистичный стейт
      await queryClient.cancelQueries({ queryKey: [''crm-board''] });

      // Сохраняем предыдущее состояние доски на случай отката
      const previousBoard = queryClient.getQueryData([''crm-board'']);

      // Мгновенно обновляем кэш в памяти клиента
      queryClient.setQueryData([''crm-board''], (oldBoard: any) => {
        return applyOptimisticMove(oldBoard, newMove);
      });

      // Возвращаем контекст с сохранённым снимком
      return { previousBoard };
    },

    // 2. Срабатывает ТОЛЬКО если сервер вернул ошибку
    onError: (err, newMove, context: any) => {
      if (context?.previousBoard) {
        // Откатываем доску в точности до исходного состояния
        queryClient.setQueryData([''crm-board''], context.previousBoard);
      }
    },

    // 3. Срабатывает ВСЕГДА в конце (для синхронизации с сервером)
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [''crm-board''] });
    },
  });
};
```

Интерфейс становится отзывчивым, как нативное десктопное приложение!

## 4. Регистрация собственного Telegram-бота через @BotFather

Настроим канал доставки мобильных уведомлений:

1. Открой мессенджер Telegram и найди официального бота: `@BotFather` (с синей галочкой верификации).
2. Нажми **Start** и отправь команду `/newbot`.
3. Введи читаемое имя бота: например, `MrDev Courses CRM Bot`.
4. Введи уникальный юзернейм (обязан заканчиваться на `_bot`): например, `mrdev_crm_alerts_bot`.
5. BotFather поздравит тебя и выдаст секретный токен доступа (API Token) вида:
   `7123456789:AAFlkjhsdf89234jhksdf-sdf8`
6. Сохрани этот токен в безопасном месте. На следующем занятии мы подключим его к Spring Boot бэкенду.

> [!WARNING]
> Никогда не публикуй токен бота в открытых файлах на GitHub. Добавляй его строго через переменные окружения (`.env` или настройки хостинга).

## Чек-лист урока

- [ ] Создана и протестирована схема таблиц `crm_boards`, `crm_columns`, `crm_cards`
- [ ] Добавлены индексы для быстрой выборки по связке `(column_id, position)`
- [ ] Разобран архитектурный паттерн Optimistic UI Updates
- [ ] Зарегистрирован Telegram-бот через `@BotFather` и получен секретный токен
- [ ] Токен сохранён в локальные переменные окружения'
        WHERE course_id = target_course_id AND day_number = 20;
    END IF;
END $$;
