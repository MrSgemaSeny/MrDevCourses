-- MrDevCourses: Migration V43 - Update Lesson 16 Full Content
-- Lesson 16: OAuth 2.0 через Google: интеграция провайдера, мультиаккаунтность, проверка ролей в админ-панели

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
        SET title = 'OAuth 2.0 через Google: интеграция провайдера, мультиаккаунтность, проверка ролей в админ-панели',
            content = '# Урок 16: Авторизация через Google OAuth 2.0 и Мультиаккаунтность

Вход через социальные провайдеры (Google) — стандарт современных веб-приложений. Пользователю не нужно придумывать и запоминать новый пароль: один клик — и он авторизован. Сегодня мы разберём протокол OAuth 2.0, зарегистрируем проект в Google Cloud и настроим бесшовную связку с нашей JWT-сессией.

## 1. Как работает Authorization Code Flow в OAuth 2.0

Протокол OAuth 2.0 обеспечивает безопасный вход без передачи пароля пользователя нашему серверу:

```
┌──────────────┐     1. Клик "Войти через Google"     ┌────────────────────────┐
│ Пользователь │ ───────────────────────────────────> │ React Frontend (:5173) │
└──────────────┘                                      └────────────────────────┘
       │                                                           │
       │ 2. Редирект на Google Login                               │ 3. Редирект на эндпоинт бэкенда
       ▼                                                           ▼
┌──────────────────────────┐   4. Успешный вход    ┌───────────────────────────────────┐
│ accounts.google.com      │ ────────────────────> │ Spring Boot Backend (:8080)       │
│ (Авторизация Google)     │  Код: ?code=AUTH_CODE │ (Обменивает code на Google токен) │
└──────────────────────────┘                       └───────────────────────────────────┘
                                                                   │
                                                   5. Поиск/создание User в PostgreSQL
                                                   6. Выпуск нашего JWT в httpOnly cookie
                                                   7. Редирект на /dashboard фронтенда
```

## 2. Регистрация в Google Cloud Console

1. Перейди в [Google Cloud Console](https://console.cloud.google.com).
2. Создай новый проект `MoneyTracker`.
3. В боковом меню выбери **APIs & Services** -> **OAuth consent screen**.
   - Выбери тип **External (Внешний)**.
   - Укажи название приложения: `MoneyTracker LMS`.
   - Укажи email разработчика и поддержки.
4. Перейди в **Credentials** -> **Create Credentials** -> **OAuth client ID**.
   - Application type: **Web application**.
   - Name: `MoneyTracker Web Client`.
   - Authorized redirect URIs: `http://localhost:8080/api/login/oauth2/code/google`.
5. Скопируй полученные `Client ID` и `Client Secret`.

## 3. Настройка Spring Boot OAuth2 Client (`application-dev.yml`)

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: ${GOOGLE_CLIENT_ID}
            client-secret: ${GOOGLE_CLIENT_SECRET}
            scope:
              - openid
              - profile
              - email
            redirect-uri: "{baseUrl}/login/oauth2/code/{registrationId}"
```

## 4. Кастомный сервис обработки пользователей (`CustomOAuth2UserService.java`)

При первом входе через Google пользователя ещё нет в нашей таблице `users`. Мы автоматически создаём для него профиль:

```java
package com.moneytracker.auth.service;

import com.moneytracker.auth.model.User;
import com.moneytracker.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setRole("STUDENT");
                    newUser.setPasswordHash(""); // OAuth аккаунт
                    newUser.setCreatedAt(Instant.now());
                    return userRepository.save(newUser);
                });

        return new CustomUserPrincipal(user, oAuth2User.getAttributes());
    }
}
```

## 5. UI Кнопка "Войти через Google" в React (`features/auth/GoogleLoginButton.tsx`)

```tsx
import React from ''react'';

export const GoogleLoginButton: React.FC = () => {
  const handleGoogleLogin = () => {
    // Прямой редирект на стандартный эндпоинт Spring Security OAuth2
    window.location.href = ''http://localhost:8080/api/oauth2/authorization/google'';
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="w-full py-2.5 px-4 bg-[#141418] hover:bg-[#18181b] border border-white/10 hover:border-zinc-500 text-white rounded font-medium flex items-center justify-center gap-3 transition-all"
    >
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.067 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
      </svg>
      <span>Продолжить с Google</span>
    </button>
  );
};
```

## Чек-лист урока

- [ ] Создан проект в Google Cloud Console и получен Client ID / Client Secret
- [ ] Настроен `application-dev.yml` с параметрами OAuth2 регистрации
- [ ] Реализован `CustomOAuth2UserService` для автоматического создания пользователя в БД
- [ ] Настроен обработчик успешного OAuth2 входа с установкой JWT в httpOnly cookie
- [ ] Проверен сквозной вход через Google в браузере'
        WHERE course_id = target_course_id AND day_number = 16;
    END IF;
END $$;
