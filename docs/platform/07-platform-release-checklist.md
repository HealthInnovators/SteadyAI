# SteadyAI Platform Release Checklist

This checklist covers the essential steps for a safe and stable deployment of the new SteadyAI modular platform.

## 1. Migration Checks
- [ ] **Data Model Validation**: Ensure all Prisma migrations have been successfully applied to the target database.
- [ ] **Backfill Verification**: Verify that existing users have been assigned personal workspaces via the backfill script.
- [ ] **Role Assignment**: Confirm that existing users have the appropriate `MEMBER` role within their new workspaces.

## 2. Environment Variables
- [ ] **Backend**: Ensure `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and all AI provider API keys (`OPENAI_API_KEY`, etc.) are configured.
- [ ] **Frontend**: Ensure `NEXT_PUBLIC_API_URL` correctly points to the deployed backend.
- [ ] **Security**: Verify that no sensitive keys are exposed in client-side configuration.

## 3. Deployment Steps
- [ ] **Backend**: Build and push Docker image (`Dockerfile.backend`) to container registry and deploy to Railway.
- [ ] **Database**: Run `npx prisma migrate deploy` to ensure the production schema is up to date.
- [ ] **Frontend**: Build and deploy to Vercel.

## 4. MCP/OpenAI Review Checks
- [ ] **Schema Validation**: Verify that MCP tool schemas (in `apps-mcp.ts`) match the expectations of the OpenAI submission.
- [ ] **Auth Boundary Check**: Confirm that sensitive/write tools (e.g., `steadyai.log_workout_session`) return a 401 for requests without a valid user token.
- [ ] **Static Widget Check**: Confirm that `ui://widget/*` resources remain accessible for unauthenticated discovery (e.g., in `resources/read`).

## 5. Privacy/Terms Compliance
- [ ] **Legal Links**: Verify that the Privacy Policy and Terms of Service links on the new `/settings` page correctly resolve to the public pages.
- [ ] **Disclosure Update**: Confirm the privacy policy on the `/privacy` page is updated to include the latest tool-specific data usage disclosures.

## 6. Smoke Tests
- [ ] **Public Site**: Verify landing page, sign-in, and auth callback function correctly.
- [ ] **App Shell**: Verify the authenticated platform shell renders correctly and navigation is role-aware.
- [ ] **Modules**: Confirm Home, Coaching, Workouts, Nutrition, Reports, Community, Store, and Settings pages load and handle empty states correctly.
- [ ] **MCP Tools**: Verify critical tools (`workout_coach`, `nutrition_coach`, `ask_agent`) are callable and return valid responses.

## 7. Rollback Steps
- [ ] **Database**: If a migration fails, identify the failed migration and use `prisma migrate resolve` if necessary, or roll back to the last stable snapshot.
- [ ] **Backend**: Revert the container image version on Railway to the last known stable build.
- [ ] **Frontend**: Revert the Vercel deployment to the previous production commit.
