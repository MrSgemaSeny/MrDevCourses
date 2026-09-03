-- MrDevCourses: Migration V36 - Update Lesson 9 Full Content
-- Lesson 9: Углубление логики: ролевая модель (покупатель / продавец), условный рендеринг по роли

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
        SET title = 'Углубление логики: ролевая модель (покупатель / продавец), условный рендеринг по роли',
            content = '# Урок 9: Ролевая модель и состояние приложения — магия Zustand

В этом уроке мы превратим статичный каталог в живое интерактивное веб-приложение. Мы разберём, что такое глобальное состояние (Global State), почему монструозный Redux ушёл в прошлое, настроим ультра-лёгкий стейт-менеджер **Zustand** и реализуем ролевую модель: когда интерфейс динамически меняется в зависимости от того, кто сейчас за экраном — Покупатель или Продавец.

## 1. Проблема пропс-дриллинга (Prop Drilling) и зачем нужен глобальный стейт

Представь: у тебя есть кнопка "Купить" внутри карточки товара, которая лежит глубоко внутри каталога:
`App` -> `CatalogPage` -> `ProductGrid` -> `ProductCard` -> `BuyButton`.

А счётчик количества товаров в корзине находится в самом верху:
`App` -> `Header` -> `CartBadge`.

Как передать информацию о клике из самой глубины дерева компонентов наверх в шапку?
В старом React приходилось прокидывать функцию обратного вызова (callback) через все промежуточные компоненты вниз, как по цепочке. Это называется **Prop Drilling**. Стоит изменить один пропс — и нужно переписывать 5 файлов.

> [!NOTE]
> **Глобальный стейт (Global State Store)** — это единый склад данных, который парит над всем приложением. Любой компонент с любого уровня дерева может мгновенно прочитать из него данные или обновить их в одну строчку.

## 2. Почему Zustand, а не Redux или React Context

В мире React есть несколько способов управлять состоянием:
1. **React Context**: Встроен в React, но страдает от лишних ререндеров. Если в контексте изменилось одно поле — перерисовываются абсолютно все компоненты, подключенные к контексту.
2. **Redux Toolkit**: Мощный, но невероятно громоздкий инструмент. Чтобы добавить одну переменную, нужно написать 40 строк шаблонного кода (actions, reducers, dispatchers).
3. **Zustand**: Современный чемпион фронтенда. Весит всего 1 килобайт, не требует никаких провайдеров (`<Provider>`), поддерживает селекторы и персист в `LocalStorage` из коробки.

Установим Zustand:
```bash
npm install zustand
```

## 3. Стейт пользователя и ролевая модель (`entities/user/model/userStore.ts`)

В нашем приложении есть две роли:
- **BUYER (Покупатель)**: Видит каталог, складывает товары в корзину, оформляет заказ.
- **SELLER (Продавец)**: Видит кнопку "+ Добавить товар", может редактировать свои позиции и смотреть аналитику продаж.

Создадим хранилище с автоматическим сохранением выбранной роли в `LocalStorage`:

```typescript
import { create } from ''zustand'';
import { persist } from ''zustand/middleware'';

export type UserRole = ''BUYER'' | ''SELLER'';

interface UserState {
  role: UserRole;
  userName: string;
  setRole: (role: UserRole) => void;
  toggleRole: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      role: ''BUYER'',
      userName: ''Алексей Иванов'',
      setRole: (role) => set({ role }),
      toggleRole: () =>
        set((state) => ({
          role: state.role === ''BUYER'' ? ''SELLER'' : ''BUYER'',
        })),
    }),
    {
      name: ''marketplace-user-role'', // Ключ в LocalStorage
    }
  )
);
```

## 4. Стейт корзины (`features/cart/model/cartStore.ts`)

Теперь создадим логику корзины: добавление товаров, увеличение количества, удаление и подсчет итоговой суммы:

```typescript
import { create } from ''zustand'';
import { persist } from ''zustand/middleware'';
import { Product } from ''@/entities/product'';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getTotalCount: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.product.id === product.id);

        if (existingItem) {
          // Если товар уже в корзине, просто увеличиваем количество
          set({
            items: currentItems.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          // Иначе добавляем новую позицию
          set({ items: [...currentItems, { product, quantity: 1 }] });
        }
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.product.id !== productId),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotalCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
      },
    }),
    {
      name: ''marketplace-cart-storage'',
    }
  )
);
```

## 5. Условный рендеринг: переключение интерфейса в шапке (`widgets/header/ui/Header.tsx`)

Теперь самое интересное — объединим оба стора в едином интерфейсе:

```tsx
import React from ''react'';
import { ShoppingBag, PlusCircle, UserCheck } from ''lucide-react'';
import { useUserStore } from ''@/entities/user'';
import { useCartStore } from ''@/features/cart'';

export const Header: React.FC = () => {
  const { role, toggleRole } = useUserStore();
  // Атомарный селектор — перерисовывает шапку только при изменении длины корзины
  const totalCount = useCartStore((state) => state.getTotalCount());

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0c]/90 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
      {/* Логотип */}
      <div className="flex items-center gap-2 font-mono font-bold tracking-tight text-lg text-white">
        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
        MarketVibe
      </div>

      {/* Панель управления и роли */}
      <div className="flex items-center gap-4">
        {/* Кнопка переключения роли */}
        <button
          onClick={toggleRole}
          className="flex items-center gap-2 px-3 py-1.5 rounded border border-white/15 hover:border-white text-xs font-mono text-zinc-300 hover:text-white transition-all"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Режим: <strong>{role === ''BUYER'' ? ''Покупатель'' : ''Продавец''}</strong></span>
        </button>

        {/* Условный рендеринг: если ПРОДАВЕЦ — показываем кнопку добавления */}
        {role === ''SELLER'' && (
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all">
            <PlusCircle className="w-4 h-4" />
            <span>Добавить товар</span>
          </button>
        )}

        {/* Условный рендеринг: если ПОКУПАТЕЛЬ — показываем корзину */}
        {role === ''BUYER'' && (
          <button className="relative p-2 rounded border border-white/10 hover:border-white text-white transition-all">
            <ShoppingBag className="w-4 h-4" />
            {totalCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-black font-mono font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {totalCount}
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  );
};
```

Попробуй кликнуть на кнопку "Режим": интерфейс мгновенно перестраивается без перезагрузки страницы!

## Чек-лист урока

- [ ] Установлен Zustand и изучен принцип работы глобального стора
- [ ] Реализован стор `useUserStore` с ролями `BUYER` / `SELLER` и персистом в LocalStorage
- [ ] Реализован стор `useCartStore` с добавлением товаров, подсчётом количества и суммы
- [ ] Внедрён условный рендеринг элементов интерфейса по текущей роли пользователя
- [ ] Проверено сохранение корзины и роли при перезагрузке страницы клавишей F5'
        WHERE course_id = target_course_id AND day_number = 9;
    END IF;
END $$;
