-- MrDevCourses: Migration V35 - Update Lesson 8 Full Content
-- Lesson 8: Старт проекта: роутинг, страницы, базовая бизнес-логика

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
        SET title = 'Старт проекта Маркетплейс: роутинг, страницы, базовая бизнес-логика',
            content = '# Урок 8: Старт разработки Маркетплейса на React 19 — от нуля к первому роуту

Сегодня мы переходим от теории к сборке реального SPA (Single Page Application). Мы развернём проект на самом быстром современном сборщике Vite, настроим строгий TypeScript, настроим удобные короткие пути импортов (Path Aliases) и создадим первый полноценный FSD-срез сущности товара.

## 1. Инструменты нового поколения: почему Vite и React 19

Раньше для создания React-приложений использовали Create React App (Webpack). Он запускался по две минуты, а каждая правка заставляла ждать перезагрузки по 10 секунд.

Сегодня стандартом индустрии является **Vite**:
- Холодный старт сервера разработки занимает меньше одной секунды.
- HMR (Hot Module Replacement) обновляет изменённый компонент на экране браузера за 50 миллисекунд без сброса состояния формы.
- React 19 приносит обновленные хуки и улучшенную производительность рендеринга.

## 2. Инициализация проекта и установка зависимостей

Открой терминал и создай чистый проект с шаблоном `react-ts` (React + TypeScript):

```bash
# 1. Создаем проект
npm create vite@latest marketplace -- --template react-ts

# 2. Переходим в папку проекта
cd marketplace

# 3. Устанавливаем базовые зависимости
npm install

# 4. Устанавливаем роутер и библиотеку современных иконок Lucide
npm install react-router-dom lucide-react
```

## 3. Настройка Path Aliases: прощайте `../../../../`

Когда проект структурирован по FSD, относительные пути вида `import { Button } from "../../../../shared/ui/button"` превращаются в кошмар. Если переместить файл на уровень выше — все пути сломаются.

Мы настроим алиас `@`, который всегда указывает на папку `src`:

В файле `vite.config.ts`:
```typescript
import { defineConfig } from ''vite'';
import react from ''@vitejs/plugin-react'';
import path from ''path'';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      ''@'': path.resolve(__dirname, ''./src''),
    },
  },
});
```

В файле `tsconfig.app.json` (внутри секции `compilerOptions`):
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

Теперь любой файл можно импортировать чисто и понятно: `import { ProductCard } from "@/entities/product"`.

## 4. Создание первого FSD-среза: Сущность Product

Создадим папки для сущности товара:
`src/entities/product/model/`
`src/entities/product/ui/`

### Шаг 1: Описание типов данных (`entities/product/model/types.ts`)
В TypeScript типы — это строгий контракт. Мы явно объявляем, какими свойствами обладает товар:

```typescript
export type ProductCategory = ''all'' | ''electronics'' | ''clothing'' | ''books'' | ''accessories'';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  imageUrl: string;
  rating: number;
  stock: number;
}
```

### Шаг 2: Компонент карточки товара (`entities/product/ui/ProductCard.tsx`)
Обрати внимание на монохромный дизайн: тёмный фон `#141418`, белая типографика, отсутствие аляповатых цветов:

```tsx
import React from ''react'';
import { Product } from ''../model/types'';

interface ProductCardProps {
  product: Product;
  actionSlot?: React.ReactNode; // Слот для кнопки действия (добавить в корзину)
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, actionSlot }) => {
  return (
    <div className="bg-[#141418] border border-white/10 hover:border-zinc-500 transition-all rounded-md p-4 flex flex-col justify-between group">
      <div>
        {/* Превью товара */}
        <div className="w-full h-44 bg-zinc-900 rounded overflow-hidden mb-3 relative">
          <img 
            src={product.imageUrl} 
            alt={product.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <span className="absolute top-2 left-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono uppercase text-zinc-300 border border-white/10">
            {product.category}
          </span>
        </div>

        {/* Заголовок и описание */}
        <h3 className="font-semibold text-white text-sm line-clamp-1 group-hover:text-zinc-200">
          {product.title}
        </h3>
        <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
          {product.description}
        </p>
      </div>

      {/* Нижняя панель с ценой и действием */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-zinc-500 uppercase font-mono block">Цена</span>
          <span className="text-base font-bold text-white font-mono">
            {product.price.toLocaleString(''ru-RU'')} ₸
          </span>
        </div>
        {actionSlot}
      </div>
    </div>
  );
};
```

### Шаг 3: Экспорт через Public API (`entities/product/index.ts`)
```typescript
export { ProductCard } from ''./ui/ProductCard'';
export type { Product, ProductCategory } from ''./model/types'';
```

## 5. Настройка клиентского роутинга (React Router)

В современных приложениях роутинг позволяет переключать страницы без перезагрузки браузера.

Создадим файл `src/app/router/AppRouter.tsx`:

```tsx
import { createBrowserRouter, RouterProvider } from ''react-router-dom'';
import { CatalogPage } from ''@/pages/catalog'';
import { ProductDetailPage } from ''@/pages/product-detail'';

const router = createBrowserRouter([
  {
    path: ''/'',
    element: <CatalogPage />,
  },
  {
    path: ''/product/:id'',
    element: <ProductDetailPage />,
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
```

Подключим `AppRouter` в `src/app/App.tsx`:
```tsx
import { AppRouter } from ''./router/AppRouter'';

export function App() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white selection:bg-white selection:text-black">
      <AppRouter />
    </div>
  );
}
```

Запусти проект командой `npm run dev` — и на экране появится чистая, быстрая стартовая витрина!

## Чек-лист урока

- [ ] Проект развёрнут на Vite с шаблоном `react-ts`
- [ ] Установлены зависимости `react-router-dom` и `lucide-react`
- [ ] Настроены path aliases `@/*` в `vite.config.ts` и `tsconfig.app.json`
- [ ] Создана сущность `Product` по стандарту FSD с публичным `index.ts`
- [ ] Настроен базовый клиентский роутер с главной страницей каталога

> [!TIP]
> На следующем уроке мы подключим глобальный стейт-менеджер Zustand, создадим корзину покупок и внедрим переключение ролей "Покупатель / Продавец".'
        WHERE course_id = target_course_id AND day_number = 8;
    END IF;
END $$;
