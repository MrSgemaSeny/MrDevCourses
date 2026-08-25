# Epic-01: Аутентификация и пользователи (Google OAuth2 + JWT)

## Статус
- **Статус:** Planned
- **Приоритет:** P0

## Цель
Реализовать безопасный вход пользователей через Google OAuth2 без паролей, выпуск JWT в httpOnly cookie, проверку сессий и ролевую модель (`STUDENT`, `ADMIN`).

## Задачи
- [ ] Настроить Spring Security 6 с `oauth2Login()`.
- [ ] Реализовать `OAuth2UserService` для создания/обновления пользователя в БД (`users`).
- [ ] Реализовать `JwtService` и генерацию токенов.
- [ ] Реализовать `JwtAuthenticationFilter` для извлечения JWT из httpOnly cookie.
- [ ] Реализовать `SecurityUtils.getCurrentUserId()`.
- [ ] Добавить эндпоинты `GET /api/v1/auth/me` и `POST /api/v1/auth/logout`.
- [ ] Frontend: страница авторизации и хук `useAuth`.
