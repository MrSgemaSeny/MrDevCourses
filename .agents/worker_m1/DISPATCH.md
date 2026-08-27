# Dispatch: Worker M1 (Enterprise Security Hardening & Rate Limiting)

Read ORIGINAL_REQUEST.md at c:\Users\murat\IdeaProjects\new_world\MrDevCourses\.agents\ORIGINAL_REQUEST.md.
Read PROJECT.md at c:\Users\murat\IdeaProjects\new_world\MrDevCourses\PROJECT.md.
Read explorer reports at:
- c:\Users\murat\IdeaProjects\new_world\MrDevCourses\.agents\explorer_backend\handoff.md
- c:\Users\murat\IdeaProjects\new_world\MrDevCourses\.agents\explorer_donors\handoff.md

## Scope & File Ownership
Files owned exclusively:
- `backend/build.gradle` (add `com.bucket4j:bucket4j-core:8.10.1`, `com.github.ben-manes.caffeine:caffeine:3.1.8`)
- `backend/src/main/java/com/mrdevcourses/common/ratelimit/**` (`RateLimiterService.java`, `RateLimitingFilter.java`, `RateLimitTier.java`, `IpResolver.java`)
- `backend/src/main/java/com/mrdevcourses/config/SecurityConfig.java` (register RateLimitingFilter after JwtAuthenticationFilter)
- `backend/src/main/java/com/mrdevcourses/modules/auth/service/AuthRateLimiter.java` (refactor or delegate to new RateLimiterService)
- `backend/src/test/java/com/mrdevcourses/common/ratelimit/**` (Unit and integration tests for Rate Limiting)

## Mandatory Requirements
1. Implement production-grade Token Bucket rate limiting via Bucket4j + Caffeine Cache with tiered policies:
   - Auth endpoints (`/api/v1/auth/**`): 10 req/15m per IP
   - AI endpoints (`/api/v1/ai/**`): 5 req/1m per User ID (fallback to IP for anonymous)
   - General API endpoints (`/api/v1/**`): 60 req/1m per IP/User ID
2. When rate limit is exceeded, return HTTP 429 Too Many Requests with structured JSON `ErrorResponse` and `Retry-After`, `X-RateLimit-Remaining` headers.
3. Enforce strict Row-Level Security (RLS) and IDOR defense across all course progress and student mutation endpoints.
4. Run `./gradlew test jacocoTestReport` and ensure 100% tests pass.
5. Write completion report in `c:\Users\murat\IdeaProjects\new_world\MrDevCourses\.agents\worker_m1\handoff.md`.

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## 2026-08-27T07:24:48Z
**Context**: Checking progress on Milestone 1 implementation.
**Content**: Please report your current progress on tests, build verification, and handoff report.
**Action**: Finish test implementation, verify with ./gradlew test, and deliver handoff.md.

