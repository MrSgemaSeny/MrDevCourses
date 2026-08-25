# Changes Summary — Milestone 1 (Auth & Session Management)

## 1. Backend Auth Module

### Entities & Repositories
- `backend/src/main/java/com/mrdevcourses/modules/auth/model/Role.java`:
  - Enum `STUDENT`, `ADMIN`.
- `backend/src/main/java/com/mrdevcourses/modules/auth/model/User.java`:
  - JPA Entity mapped to `users` table (`V1__create_users.sql`).
  - Fields: `id`, `email`, `name`, `avatarUrl`, `googleId`, `role`, `createdAt` with `@PrePersist` UTC initialization.
- `backend/src/main/java/com/mrdevcourses/modules/auth/repository/UserRepository.java`:
  - `findByEmail`, `findByGoogleId`, `existsByEmail`.

### DTOs & Principals
- `backend/src/main/java/com/mrdevcourses/modules/auth/dto/UserDto.java`:
  - Data transfer object with `fromEntity` factory method.
- `backend/src/main/java/com/mrdevcourses/modules/auth/security/UserPrincipal.java`:
  - Implements `OAuth2User` and `UserDetails`, encapsulates user identity, claims, and `ROLE_*` authorities.

### Security & Token Services
- `backend/src/main/java/com/mrdevcourses/modules/auth/service/JwtTokenProvider.java`:
  - JJWT 0.12.5 implementation with HMAC-SHA256 signing, claims serialization (`userId`, `email`, `role`), validation, and parsing.
- `backend/src/main/java/com/mrdevcourses/modules/auth/security/JwtAuthenticationFilter.java`:
  - Extracts JWT from `mrdevcourses_token` httpOnly cookie or fallback `Authorization: Bearer <token>` header, authenticates in `SecurityContextHolder`.
- `backend/src/main/java/com/mrdevcourses/modules/auth/service/CustomOAuth2UserService.java`:
  - Extends `DefaultOAuth2UserService`, extracts Google attributes (`sub`, `email`, `name`, `picture`), provisions new user or updates existing user.
- `backend/src/main/java/com/mrdevcourses/modules/auth/security/OAuth2AuthenticationSuccessHandler.java`:
  - Generates JWT and attaches `mrdevcourses_token` httpOnly cookie (`Path=/`, `Max-Age=86400`, `SameSite=Lax`), redirects to `/auth/callback`.
- `backend/src/main/java/com/mrdevcourses/modules/auth/security/OAuth2AuthenticationFailureHandler.java`:
  - Redirects failure to `/auth?error=...`.
- `backend/src/main/java/com/mrdevcourses/modules/auth/security/RestAuthenticationEntryPoint.java`:
  - Returns structured `ErrorResponse` (HTTP 401) on unauthenticated access.
- `backend/src/main/java/com/mrdevcourses/config/SecurityConfig.java`:
  - Configures stateless session management, CORS configuration source with credentials, public endpoints, OAuth2 login pipeline, and JWT filter.
- `backend/src/main/java/com/mrdevcourses/common/util/SecurityUtils.java`:
  - Thread-local accessor for `getCurrentUserId()`, `getCurrentUserRole()`, `isAdmin()`, `isAuthenticated()`, preventing IDOR vulnerabilities.
- `backend/src/main/java/com/mrdevcourses/modules/auth/controller/AuthController.java`:
  - `GET /v1/auth/me` -> returns `ApiResponse<UserDto>` of current user.
  - `POST /v1/auth/logout` -> clears `mrdevcourses_token` cookie (`Max-Age=0`) and returns `ApiResponse<Void>`.
- `backend/src/main/java/com/mrdevcourses/common/exception/GlobalExceptionHandler.java`:
  - Added handlers for `AccessDeniedException` (403) and `AuthenticationException` (401).
- `backend/src/test/resources/application-test.yml`:
  - Configured `H2Dialect` for in-memory PostgreSQL mode testing.

## 2. Backend Tests
- `backend/src/test/java/com/mrdevcourses/modules/auth/service/JwtTokenProviderTest.java`:
  - 5 tests for token generation, validation, tampered signature rejection, expiration, and claim extraction.
- `backend/src/test/java/com/mrdevcourses/modules/auth/security/JwtAuthenticationFilterTest.java`:
  - 4 tests for cookie authentication, bearer header authentication, invalid token handling, and unauthenticated requests.
- `backend/src/test/java/com/mrdevcourses/common/util/SecurityUtilsTest.java`:
  - 3 tests for student context, admin context, and unauthenticated exception handling.
- `backend/src/test/java/com/mrdevcourses/modules/auth/service/CustomOAuth2UserServiceTest.java`:
  - 4 tests for new user provisioning, existing user update by googleId, email linking, and missing email validation.
- `backend/src/test/java/com/mrdevcourses/modules/auth/security/OAuth2AuthenticationSuccessHandlerTest.java`:
  - 1 test for cookie generation and redirect behavior.
- `backend/src/test/java/com/mrdevcourses/modules/auth/controller/AuthControllerTest.java`:
  - 4 integration tests for `/me` via cookie, `/me` via Bearer header, `/me` unauthenticated 401, and `/logout` cookie deletion.

## 3. Frontend Auth Layer

- `frontend/package.json`:
  - Explicitly registered `"axios": "^1.7.9"`.
- `frontend/src/shared/api/base.ts`:
  - Configured `apiClient` with `baseURL: '/api'`, `withCredentials: true`, and 401 response interceptor.
- `frontend/src/entities/user/`:
  - `model/types.ts`: `UserRole`, `User`, `UserDto`.
  - `api/userApi.ts`: `getMe()`, `logout()`.
  - `index.ts`: Public entity exports.
- `frontend/src/features/auth/`:
  - `model/useAuth.ts`: Auth hook exposing user state and actions.
  - `ui/GoogleLoginButton.tsx`: High-contrast Envie dark themed Google OAuth2 trigger button.
  - `ui/LogoutButton.tsx`: Logout action button.
  - `index.ts`: Feature exports.
- `frontend/src/app/providers/AuthProvider.tsx`:
  - React AuthContext and provider with automatic session restore via `userApi.getMe()`.
- `frontend/src/app/router/ProtectedRoute.tsx`:
  - Route guard redirecting to `/auth` when unauthenticated, with support for `adminOnly` protection and loading spinner.
- `frontend/src/pages/LoginPage.tsx`:
  - Envie dark aesthetic login page (`#09090b` bg, `rgba(24, 24, 27, 0.8)` card, `#27272a` borders, error query param handling).
- `frontend/src/pages/AuthCallbackPage.tsx`:
  - Callback landing component completing auth handshake and redirecting to `/courses`.
- `frontend/src/app/App.tsx`:
  - Responsive header displaying dynamic auth state (courses, dashboard, admin panel link for admin role, user avatar, logout button vs login button).
- `frontend/src/main.tsx` & `frontend/src/app/router/index.tsx`:
  - Auth provider and protected routes integration.

## 4. Frontend Tests
- `frontend/src/app/providers/AuthProvider.test.tsx`: 4 tests.
- `frontend/src/app/router/ProtectedRoute.test.tsx`: 5 tests.
- `frontend/src/features/auth/GoogleLoginButton.test.tsx`: 3 tests.
- `frontend/src/pages/LoginPage.test.tsx`: 3 tests.
- `frontend/src/app/App.test.tsx`: 3 tests.
- Total 18 tests passing 100% green.
