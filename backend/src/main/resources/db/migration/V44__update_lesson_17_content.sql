-- MrDevCourses: Migration V44 - Update Lesson 17 Full Content
-- Lesson 17: Three.js: 3D-сцена, анимации, интерактив — Second Brain разработчика: Notion/Obsidian система

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
        SET title = 'Three.js: 3D-сцена, анимации, интерактив — Second Brain разработчика: Notion/Obsidian система',
            content = '# Урок 17: Интерактивная 3D графика на Three.js и Второй Мозг разработчика

Сегодня мы объединим два мощных инженерных навыка: выведем визуал нашего финансового трекера на премиальный уровень с помощью интерактивной 3D-сцены на Three.js и внедрим систему **Second Brain (Второй Мозг)** для структурирования своего опыта, архитектурных шаблонов и сниппетов.

## 1. Зачем разработчику Three.js и WebGL

Three.js — это главная JavaScript-библиотека для создания трёхмерной графики прямо в браузере. Вместо тяжелых видеороликов или статических скриншотов мы рендерим интерактивные 3D-объекты на WebGL-холсте (Canvas) с прямым аппаратным ускорением видеокарты (GPU).

Ключевые строительные блоки Three.js:
1. **Scene (Сцена)**: Виртуальный трёхмерный мир, в котором размещаются объекты, камеры и источники света.
2. **PerspectiveCamera (Камера)**: Имитирует объектив камеры или человеческий глаз. Принимает угол обзора (FOV), соотношение сторон (Aspect Ratio) и плоскости отсечения.
3. **WebGLRenderer (Рендерер)**: Механизм, который 60 раз в секунду рассчитывает лучи света и рисует картинку на Canvas-элементе.
4. **Mesh (Сетка / 3D-объект)**: Комбинация геометрической формы (Geometry) и материала (Material).
5. **Light (Источники света)**: AmbientLight (мягкий рассеянный фоновый свет) и DirectionalLight (направленный луч, создающий тени и объём).

## 2. Разработка интерактивного 3D Визуализатора в React (`widgets/financial-3d/FinancialScene.tsx`)

Установим Three.js и типы:
```bash
npm install three @types/three
```

Создадим компонент с анимацией вращения и строгой утилизацией WebGL-памяти:

```tsx
import React, { useEffect, useRef } from ''react'';
import * as THREE from ''three'';

export const FinancialScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Инициализация Сцены и Камеры
    const scene = new THREE.Scene();
    const width = containerRef.current.clientWidth;
    const height = 340;
    const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000);
    camera.position.z = 3.6;

    // 2. Рендерер с поддержкой прозрачного фона (alpha: true)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // 3. Создаем 3D-куб (Символ защищенного финансового хранилища)
    const geometry = new THREE.BoxGeometry(1.6, 1.6, 1.6);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      wireframe: true,       // Строгий монохромный каркас
      roughness: 0.1,
      metalness: 0.9,
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // 4. Освещение сцены
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
    directionalLight.position.set(3, 5, 4);
    scene.add(directionalLight);

    // 5. Анимационный цикл (60 FPS)
    let animationFrameId: number;
    const animate = () => {
      cube.rotation.x += 0.005;
      cube.rotation.y += 0.008;
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    // 6. Очистка ресурсов при размонтировании (Critical for Single Page Applications!)
    return () => {
      cancelAnimationFrame(animationFrameId);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.innerHTML = '''';
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-[340px] flex items-center justify-center bg-[#0e0e11] border border-white/10 rounded-md overflow-hidden relative" 
    >
      <div className="absolute top-3 left-4 font-mono text-xs uppercase tracking-widest text-zinc-500">
        3D Core • Secure Vault
      </div>
    </div>
  );
};
```

> [!IMPORTANT]
> Обрати внимание на блок очистки памяти (`geometry.dispose()`, `material.dispose()`, `renderer.dispose()`). Браузерный WebGL не освобождает видеопамять автоматически. Если не вызвать `dispose()`, при каждом переходе между страницами будет происходить утечка памяти, и через 10 минут вкладка браузера упадёт.

## 3. Second Brain (Второй Мозг) инженера: управление знаниями

Вайбкодинг и современная разработка требуют работы с огромным объёмом информации. Если держать все команды, настройки и архитектурные решения в голове — наступает выгорание и забываются ключевые детали.

Система **Second Brain** строится по фреймворку **PARA** (в Notion или Obsidian):
- **Projects (Проекты)**: Текущие задачи с дедлайном (например, `MrDevCourses`, `MoneyTracker v1.0`).
- **Areas (Сферы ответственности)**: Постоянные стандарты качества (`Архитектура`, `Безопасность JWT`, `CORS`).
- **Resources (Ресурсы)**: Библиотека сниппетов, шпаргалки по SQL, шаблоны промптов для AI.
- **Archive (Архив)**: Завершенные проекты для сохранения истории.

> [!TIP]
> Каждое решённое сложное препятствие (например, победа над проблемой N+1 или настройка OAuth 2.0) сразу записывай в журнал Second Brain в формате: *Симптом -> Реальная причина -> Как починили*. Через год этот журнал станет твоим самым ценным капиталом.

## Чек-лист урока

- [ ] Установлен пакет `three` и типизация `@types/three`
- [ ] Создан компонент `FinancialScene` с монохромной wireframe-геометрией
- [ ] Настроена корректная утилизация WebGL ресурсов (`dispose()`) в `useEffect`
- [ ] Развёрнута и структурирована база знаний Second Brain по методологии PARA'
        WHERE course_id = target_course_id AND day_number = 17;
    END IF;
END $$;
