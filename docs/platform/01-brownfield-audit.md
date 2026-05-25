# Brownfield Architecture Audit: SteadyAI

This document provides a practical, implementation-focused audit of the existing SteadyAI application structure.

## 1. Web Routes (Next.js)

The frontend is a Next.js application located in the `/web` directory, using the App Router for routing.

- **Structure**: Routes are defined by the directory structure in `web/src/app`.
- **Authentication**: Authentication is managed globally by `web/src/auth/AuthProvider.tsx`. This provider wraps the entire application.
- **Protected Routes**: The `useRequireAuth()` hook, which is likely used in page components or layouts, redirects unauthenticated users to the sign-in page.
- **Public Routes**:
  - `/sign-in`: User login page.
  - `/auth/callback`: OAuth callback endpoint.
  - `/privacy`: Privacy policy.
  - `/terms`: Terms of service.
- **Authenticated Routes**: All other routes require a valid user session, including:
  - `/`: Dashboard (implicitly authenticated).
  - `/onboarding`: User setup flow.
  - `/challenges`:- `/community`: Social feed and groups.
  - `/reports`: User progress and data.
  - `/settings`: User profile and settings.
  - `/store`: In-app products.

## 2. API Route Groups (Fastify)

The backend is a Fastify application with routes defined in `src/routes`. All business logic API routes are prefixed with `/api`.

- **`agents.ts`**: Handles requests for AI-powered agents (Habit Coach, Meal Planner).
- **`assistant.ts`**: Provides a general-purpose assistant endpoint.
- **`challenges.ts`**: Manages community challenges, participation, and check-ins.
- **`community.ts`**: Manages community posts, groups, and interactions.
- **`educator.ts`**: Provides access to the Educator AI for lessons and myth correction.
- **`health.ts`**: Manages connections to health data sources (e.g., Health Connect).
- **`mcp.ts`**: Exposes user summary endpoints, likely for internal use or a control panel.
- **`notifications.ts`**: Manages user notification settings and dispatch.
- **`nutrition.ts`**: Handles nutrition logging and analysis.
- **`onboarding.ts`**: Manages the user onboarding process.
- **`reports.ts`**: Generates and retrieves user reports.
- **`store.ts`**: Manages products and purchases.
- **`workouts.ts`**: Manages workout sessions and plans.

A separate, non-prefixed set of routes is defined in `apps-mcp.ts` for the ChatGPT integration (see section 5).

## 3. Prisma Models & Relationships

The data model is defined in `prisma/schema.prisma`. It uses a PostgreSQL database.

- **Core Model**: The `User` model is central, connected to most other models.
- **Major Models & Relationships**:
  - `User`: Stores user profile, onboarding status, and owns many other records.
  - `CommunityGroup`: Represents a container for `Challenge`s and `Post`s, owned by a `User`.
  - `Challenge` & `ChallengeParticipation`: Defines community challenges and tracks user involvement.
  - `Post`: Represents a post in a `CommunityGroup`, can be a reply to another `Post`.
  - `Product` & `Purchase`: A simple e-commerce model where users can purchase products.
  - `CoachFeedbackRequest`: Allows users to request feedback related to a `Product`.
  - `HealthRecord`: Stores health data (steps, heart rate, etc.) synced from a `UserHealthConnection`.
  - `NutritionEntry`: Tracks user's nutritional intake, with associated `NutritionImage` and `NutritionItem`s.
  - `NutritionAiAnalysis`: Logs the results of AI-based nutrition analysis.

## 4. Auth/Session Model

- **Identity Provider**: Supabase is the primary identity provider.
- **Backend Authentication**:
  - All protected API endpoints use the `authenticateRequest` middleware (`src/middleware/auth.ts`).
  - It validates a `Bearer` token from the `Authorization` header against the Supabase `/auth/v1/user` endpoint.
  - On success, `request.userId` is populated for use in route handlers.
  - For development, it supports an `x-test-user-id` header to bypass Supabase.
- **Frontend Session Management**:
  - The `AuthProvider` in the web app manages the user session.
  - It uses `@supabase/auth-helpers-nextjs` (inferred from `createBrowserSupabaseClient`) to handle login, logout, and session refresh.
  - The JWT access token is stored in `localStorage` under the key `steadyai.jwt`.

## 5. MCP/ChatGPT App Surface

The application exposes a rich integration for use within a ChatGPT custom GPT.

- **Endpoints**: Defined in `src/routes/apps-mcp.ts` and registered at the root level.
  - `GET /api/apps/manifest`: Exposes the app manifest.
  - `POST /api/apps/mcp`: The main JSON-RPC 2.0 endpoint for tool calls.
  - It also includes OAuth endpoints (`/oauth/authorize`, `/oauth/token`) for user authentication from ChatGPT.
- **Exposed Tools**: A wide range of tools are exposed to the LLM, including:
  - `steadyai.ask_agent`: To invoke the various AI coaches.
  - `steadyai.workout_coach`: To generate and manage workouts.
  - `steadyai.log_workout_session`: To save a completed workout.
  - `steadyai.nutrition_coach`: For meal analysis.
  - `steadyai.get_user_summary`: To fetch a user's profile.
- **Rich UI Widgets**: The integration provides HTML/JS widgets (`steadyai-agent-card.html`, `steadyai-workout-card.html`, etc.) that are rendered directly in the ChatGPT interface, offering an interactive experience. The code for these is embedded within `apps-mcp.ts`.

## 6. Deployment Flow

The deployment strategy is well-documented in `DEPLOYMENT.md` and configured across several files.

- **Backend**:
  - Packaged as a Docker image using `Dockerfile.backend`.
  - Deployed to Railway.
  - Requires environment variables for database connection, Supabase keys, and various API keys.
  - Database migrations are run post-deployment using `npx prisma migrate deploy`.
- **Frontend**:
  - Deployed to Vercel.
  - The `web` directory is specified as the root.
  - Requires the `NEXT_PUBLIC_API_URL` environment variable to point to the deployed backend.
- **Local Development**: `docker-compose.yml` orchestrates local containers for the backend and frontend.
- **Mobile**: The previous native mobile project and mobile CI workflow have been removed. The recommended mobile path is a future Expo-based app under a separate `mobile/` workspace.

## 7. Risks & Key Considerations for Migration

- **Complex Auth Flow**: The authentication flow is split between the Next.js frontend, the Fastify backend, and the Supabase identity service. Any migration must carefully replicate the token validation and session management logic. The OAuth flow for the MCP integration adds another layer of complexity.
- **Environment Variable Hell**: The system relies on a large number of environment variables for configuration. A central, secure, and easily auditable configuration management strategy will be crucial.
- **Redundant Route Registration**: The `appsMcpRoutes` appear to be registered twice in `app.ts`, once at the root and once under the `/api` prefix via `registerRoutes`. This could lead to unpredictable behavior and should be clarified and consolidated. The root registration seems to be the one that is actually active for the MCP OAuth flow.
- **Monolithic MCP File**: The `src/routes/apps-mcp.ts` file is extremely large (over 3700 lines) and contains business logic, route definitions, and embedded HTML/CSS/JS for UI widgets. This should be broken down into smaller, more manageable modules.
- **Database Dependency**: The entire application is tightly coupled to the PostgreSQL database schema defined in Prisma. Any database changes will have wide-ranging effects.
- **Tightly Coupled AI Services**: The AI agent and coaching logic is embedded directly in the backend services. Decoupling this into a separate, scalable service might be beneficial in the long run.
