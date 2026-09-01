# Epic-01: Аутентификация и пользователи (Google OAuth2 + JWT)

## Статус
- **Статус:** Completed
- **Приоритет:** P0

## Цель
Реализовать безопасный вход пользователей через Google OAuth2 и Email/пароль, выпуск JWT в httpOnly cookie, проверку сессий, защиту от Takeover и ролевую модель (`STUDENT`, `ADMIN`).

## Задачи
- [x] Настроить Spring Security 6 с `oauth2Login()`.
- [x] Реализовать `CustomOAuth2UserService` для создания/обновления пользователя в БД (`users`).
- [x] Реализовать `JwtTokenProvider`, поддержку Remember-Me (7-30 дней) и `JwtBlacklistService`.
- [x] Реализовать `JwtAuthenticationFilter` для извлечения JWT из httpOnly cookie.
- [x] Реализовать `SecurityUtils.getCurrentUserId()`.
- [x] Добавить эндпоинты `GET /api/v1/auth/me` и `POST /api/v1/auth/logout`.
- [x] Frontend: страница авторизации, форма Email-входа, кнопка Google OAuth2 и хук `useAuth`.
