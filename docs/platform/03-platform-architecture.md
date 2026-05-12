# Platform Architecture: SteadyAI Modular Platform

This document specifies the brownfield technical architecture for evolving SteadyAI into a modular, multi-role platform. It retains the existing core technology stack (Next.js, Fastify, Prisma, Supabase) while introducing new patterns to support future growth.

## 1. Web Route Structure

To support distinct experiences for different user roles, the web application's routing will be organized by role-based prefixes.

-   **/app**: The primary experience for **Members**. All existing user-facing routes will be migrated under this prefix.
    -   Example: ` /challenges` becomes `/app/challenges`.
    -   Example: ` /settings` becomes `/app/settings`.
-   **/coach**: A dedicated section for **Coaches**. This area will house all coach-specific dashboards and tools.
    -   Example: `/coach/dashboard` (roster overview).
    -   Example: `/coach/members/:memberId/reports` (individual member report).
-   **/admin**: A secure area for **Admins** to manage the platform.
    -   Example: `/admin/users` (user management).
    -   Example: `/admin/agentops` (AI agent monitoring).

This structure provides clear separation of concerns, simplifies role-based authorization at the routing and layout level, and allows for independent development of each role's experience.

## 2. Backend Module Boundaries

The backend `src` directory will be restructured to reflect the modular design. The current `routes` and `services` directories will be reorganized into domain-focused modules.

```
src/
├── modules/
│   ├── workouts/
│   │   ├── workouts.routes.ts
│   │   ├── workouts.service.ts
│   │   └── workouts.types.ts
│   ├── nutrition/
│   ├── community/
│   ├── coaching/      # New module
│   └── ...            # Other domain modules
│
├── platform/
│   ├── auth/          # Auth middleware, role checks
│   ├── context.ts     # Platform Context definition and creation
│   ├── prisma/        # Prisma client setup
│   └── types.ts       # Core shared types
│
└── app.ts             # Fastify server setup
```

-   **`src/modules`**: Each subdirectory represents a distinct functional domain from the PRD (Workouts, Nutrition, etc.). It encapsulates the routes, services, and types for that domain.
-   **`src/platform`**: This new directory will contain the shared kernel of the application, including the platform context, core auth logic, database client, and shared types that are used across all modules.

This modular structure promotes loose coupling and allows teams to work on different modules with minimal overlap.

## 3. Shared Platform Context Contract

A `PlatformContext` will be established for every authenticated API request. This context object will be constructed by a middleware and injected into the Fastify request object, making it available to all services.

```typescript
// src/platform/types.ts

export enum UserRole {
  MEMBER = 'MEMBER',
  COACH = 'COACH',
  ADMIN = 'ADMIN',
}

export interface PlatformContext {
  // The currently authenticated user
  user: {
    id: string;
    email?: string;
  };

  // The active workspace for the current request
  workspace: {
    id: string;
    name: string;
    ownerId: string;
  };

  // The user's membership details within the active workspace
  membership: {
    id: string;
    role: UserRole;
    // Future: permissions: string[];
  };
}
```

This contract ensures that every service has a consistent and reliable way to determine the current user's identity, role, and the workspace they are operating in.

## 4. Role and Workspace Model (Prisma)

To support the new user roles and future multi-user capabilities, the Prisma schema will be updated.

```prisma
// Add to prisma/schema.prisma

enum UserRole {
  MEMBER
  COACH
  ADMIN
}

model Workspace {
  id         String                @id @default(uuid())
  name       String
  ownerId    String                @db.Uuid
  owner      User                  @relation(fields: [ownerId], references: [id])
  memberships WorkspaceMembership[]
  createdAt  DateTime              @default(now())
  updatedAt  DateTime              @updatedAt
}

model WorkspaceMembership {
  id          String    @id @default(uuid())
  workspaceId String    @db.Uuid
  userId      String    @db.Uuid
  role        UserRole
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime  @default(now())

  @@unique([workspaceId, userId])
}

// Modify existing User model
model User {
  id                   String                  @id @default(uuid()) @db.Uuid
  // ... existing fields
  
  // A user can be in multiple workspaces
  workspaceMemberships WorkspaceMembership[]
  
  // A user can own multiple workspaces
  ownedWorkspaces      Workspace[]
}
```

This model introduces a many-to-many relationship between `User` and a new `Workspace` entity, with the `WorkspaceMembership` table defining the user's `role` within each workspace.

## 5. Migration Strategy

A phased approach will be used to migrate the existing application to the new architecture with minimal disruption.

1.  **Phase 1: Data Model Migration**
    -   Create and apply a Prisma migration to introduce the `Workspace`, `WorkspaceMembership`, and `UserRole` models.
    -   Write a one-time data migration script to:
        1.  Create a default "General" `Workspace` for all existing users.
        2.  Iterate through every existing `User`.
        3.  Create a `WorkspaceMembership` record for each user, linking them to the new "General" workspace with the `MEMBER` role.

2.  **Phase 2: Backend Refactoring**
    -   Implement the `PlatformContext` middleware. Initially, it will be hardcoded to use the "General" workspace for all users.
    -   Incrementally refactor services to be "workspace-aware". All database queries must be updated to include a `where: { workspaceId: ... }` clause, scoping data to the context's active workspace. This prevents data leakage between workspaces.
    -   The `optionalAuthenticateRequest` middleware must be updated to handle the new role model.

3.  **Phase 3: Frontend Refactoring**
    -   Reorganize the Next.js `app` directory to reflect the new `/app`, `/coach`, `/admin` route structure. The existing application logic will be moved under `/app`.
    -   Create new `layout.tsx` files for `/coach` and `/admin` to handle role-specific navigation and authorization.
    -   Update all data-fetching hooks and components to work with the new workspace-scoped API endpoints.

4.  **Phase 4: New Feature Development**
    -   Once the new architecture is in place, build the new UIs for the Coach and Admin modules.

## 6. Testing Strategy

A multi-layered testing strategy is essential to ensure quality and security.

-   **Unit Tests**: All new and refactored services must have comprehensive unit tests, with a strong focus on mocking the `PlatformContext` to test data scoping logic.
-   **Integration Tests**:
    -   Test the API endpoints with different roles to enforce authorization rules (e.g., a `MEMBER` cannot access a `COACH`-only endpoint).
    -   Test the `PlatformContext` middleware thoroughly to ensure it correctly resolves the user, role, and workspace.
-   **End-to-End (E2E) Tests**:
    -   Create separate E2E test suites for each role (Member, Coach, Admin).
    -   **Crucially**, add tests that verify data isolation. For example, log in as `Coach A` and assert that they cannot view data belonging to `Coach B`'s members.
    -   Log in as a `MEMBER` and assert that they cannot access `/coach` or `/admin` routes.
-   **Regression Testing**: Maintain and expand the existing test suite for all original member-facing features and the critical ChatGPT MCP integration to catch any regressions introduced during the refactoring.

