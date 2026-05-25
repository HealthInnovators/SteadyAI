# SteadyAI Mobile

Expo-based iOS and Android client for SteadyAI.

## Scripts

```bash
npm install
npm run start
npm run ios
npm run android
npm run typecheck
```

## Environment

Copy `.env.example` to `.env` and set the public runtime values:

- `EXPO_PUBLIC_API_BASE_URL`
- `EXPO_PUBLIC_WEB_BASE_URL`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_ENABLE_APPLE_AUTH`

Business logic stays in the existing Fastify backend. The mobile app should consume backend APIs instead of duplicating workout, nutrition, or AI routing logic.

## Authentication

Mobile auth uses Supabase with `expo-secure-store` session persistence.

Supported flows:

- Email/password sign in
- Email/password sign up
- Google OAuth through the system browser
- Apple OAuth when `EXPO_PUBLIC_ENABLE_APPLE_AUTH=true`

Add this redirect URL in Supabase Auth settings for local Expo testing:

```text
steadyai://auth/callback
```

For Expo Go, also add the Expo development redirect URL shown by `Linking.createURL('/auth/callback')` when running the app. Standalone builds should use the `steadyai://auth/callback` scheme.

## API Client

The shared backend client lives in `src/api`.

Current coverage:

- `POST /api/assistant/message`
- `GET /api/workouts/preferences`
- `GET /api/workouts/history`
- `GET /api/workouts/exercise-media`
- `POST /api/workouts/session-summary`
- `POST /api/nutrition/ingest`
- `GET /api/nutrition/entries`
- `POST /api/onboarding`
- `GET /api/reports/overview`
- `GET /api/platform/context`

Create a client with:

```ts
import { createApiClient } from './src/api';

const api = createApiClient({ token: () => sessionToken });
```
