-- MrDevCourses: Migration V48 - Update Lesson 21 Full Content
-- Lesson 21: Самостоятельная работа студента: декомпозиция на фазы, написание промптов, старт реализации

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
        SET title = 'Самостоятельная работа: декомпозиция на фазы, написание промптов, старт реализации',
            content = '# Урок 21: Практикум: Реализация интерактивной Kanban-доски на @dnd-kit

Сегодня день глубокого погружения в практическую разработку! Мы соединим фронтенд с мощным тулкитом `@dnd-kit`, настроим плавное перетаскивание карточек между колонками без лагов и свяжем действия пользователя с оптимистичными обновлениями состояния.

## 1. Архитектура Drag-and-Drop: почему старые библиотеки ломали интерфейс

Многие разработчики до сих пор по привычке тянут в проект библиотеку `react-beautiful-dnd`. Но она была заброшена создателями много лет назад, не поддерживает React 19, сыпет десятками предупреждений в консоль и намертво зависает на смартфонах при попытке прокрутить страницу.

Современный стандарт фронтенда — **@dnd-kit**:
- Полная поддержка React 18 и 19.
- Модульная архитектура: ты подключаешь только то, что нужно (`core`, `sortable`, `utilities`).
- Полная кастомизация сенсоров мыши, тачпада и сенсорных экранов.
- Наличие механизма `DragOverlay` для рендеринга идеального элемента-призрака под курсором.

Установим пакеты:
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

## 2. Настройка сенсоров и защита от ложных срабатываний

Частая проблема новичков: пользователь хочет просто кликнуть на карточку, чтобы открыть её описание, но малейшее движение мышки на 1 пиксель расценивается как начало перетаскивания. Клик не срабатывает, пользователь раздражён.

В `@dnd-kit` мы настраиваем **Activation Constraint (Ограничение активации)**: перетаскивание начинается ТОЛЬКО если курсор сдвинулся минимум на 5-8 пикселей при зажатой кнопке:

```typescript
import { 
  useSensor, 
  useSensors, 
  PointerSensor, 
  KeyboardSensor 
} from ''@dnd-kit/core'';
import { sortableKeyboardCoordinates } from ''@dnd-kit/sortable'';

export const useKanbanSensors = () => {
  return useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6, // Перетаскивание начнётся только после смещения на 6 пикселей
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
};
```

## 3. Каркас интерактивной доски с DragOverlay

Механизм `DragOverlay` — это секрет плавного визуала уровня Linear и Trello. Когда карточка поднимается в воздух:
- На её месте в колонке остаётся полупрозрачная заглушка (placeholder).
- А копия карточки рендерится в специальном глобальном портале поверх всех окон и плавно следует за курсором.

```tsx
import React, { useState } from ''react'';
import { 
  DndContext, 
  DragOverlay, 
  DragStartEvent, 
  DragEndEvent, 
  closestCorners 
} from ''@dnd-kit/core'';
import { KanbanColumn } from ''./KanbanColumn'';
import { KanbanCard } from ''./KanbanCard'';
import { useKanbanSensors } from ''./hooks/useKanbanSensors'';

export const KanbanBoard: React.FC<{ columns: any[] }> = ({ columns }) => {
  const sensors = useKanbanSensors();
  const [activeCard, setActiveCard] = useState<any | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    // Запоминаем, какую карточку взяли в руки
    const { active } = event;
    setActiveCard(active.data.current?.card || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    // Если бросили мимо колонок — ничего не делаем
    if (!over) return;

    const activeCardId = active.id;
    const overId = over.id;

    // Вычисляем новую колонку и позицию
    // И триггерим оптимистичную мутацию
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 p-6 overflow-x-auto min-h-[calc(100vh-80px)] bg-[#0a0a0c]">
        {columns.map((col) => (
          <KanbanColumn key={col.id} column={col} />
        ))}
      </div>

      {/* Летающий элемент под курсором */}
      <DragOverlay>
        {activeCard ? (
          <div className="rotate-2 scale-105 shadow-2xl transition-transform">
            <KanbanCard card={activeCard} isOverlay />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
```

## 4. Как писать точные промпты для AI при сложной логике DND

Логика перемещения между разными списками — одна из самых сложных во фронтенде. Если попросить AI "напиши мне drag and drop", он почти наверняка забудет случай, когда карточку перетаскивают в совершенно пустую колонку.

Используй этот структурированный промпт:

```markdown
Напиши функцию handleDragEnd для @dnd-kit в React 19 Kanban доске.
Входные данные:
- active: перетаскиваемая карточка (содержит cardId и sourceColumnId).
- over: цель, над которой отпустили карточку. Внимание: целью может быть как ДРУГАЯ КАРТОЧКА в колонке, так и САМА КОЛОНКА (если колонка пустая).

Требования:
1. Корректно определи targetColumnId в обоих случаях (когда over — карточка, и когда over — колонка).
2. Вычисли новый индекс (position) с помощью функции arrayMove.
3. Вызови оптимистичную мутацию moveCardMutation({ cardId, targetColumnId, newPosition }).
4. Обработай сценарий, когда карточку вернули на то же самое место (не слать лишних запросов).
```

## Чек-лист урока

- [ ] Установлен `@dnd-kit` и настроены сенсоры с защитным смещением `distance: 6`
- [ ] Реализованы компоненты `KanbanBoard`, `KanbanColumn`, `KanbanCard`
- [ ] Настроен `DragOverlay` с визуальным наклоном карточки при полёте (`rotate-2`)
- [ ] Обработаны граничные случаи: перетаскивание в пустую колонку и возврат на место
- [ ] Проверена плавная работа на 60 FPS без дрожания интерфейса'
        WHERE course_id = target_course_id AND day_number = 21;
    END IF;
END $$;
