# ADR-001: Модульный монолит (Modular Monolith) на Spring Boot 3 и React 19 FSD

## Статус
Accepted

## Дата
2026-08-31

## Контекст
Платформа MrDevCourses разрабатывается как учебная база уровня 3 (Educational MVP) для обучения backend/fullstack разработке. Требовалось выбрать архитектурный паттерн, обеспечивающий:
- Высокую скорость и простоту локальной разработки и тестирования.
- Отсутствие сетевых накладных расходов и сложностей распределённых микросервисов (service discovery, distributed tracing, network latency).
- Строгие границы между предметными областями (Auth, Course, Lesson, Quiz, Progress, AI RAG, Grader, Admin, Audit).

## Решение
Использовать архитектуру **Модульного Монолита** с чётким разделением слоёв:
- **Backend (Spring Boot 3.3.0)**: разделение по модульным пакетам (com.mrdev.modules.*), где каждый модуль инкапсулирует свои Controller, Service, Repository, DTO и Model. Общие утилиты, фильтры и обработчики ошибок вынесены в com.mrdev.common.*.
- **Frontend (React 19 + TypeScript + Vite)**: организация по методологии **Feature-Sliced Design (FSD)**: pp, pages, widgets, eatures, entities, shared.

## Последствия
- Единый процесс сборки и быстрое тестирование сквозных сценариев (E2E) без поднятия внешних сервисов.
- Запрет на God Objects и перекрёстные неконтролируемые зависимости.
- Чёткие контракты между слоями приложения.
