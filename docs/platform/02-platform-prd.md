# Product Requirements Document: SteadyAI as a Modular Platform

This document outlines the requirements for evolving the SteadyAI application into a modular, multi-tenant platform for members, coaches, and administrators.

## 1. Target Users

The platform will be designed to serve three primary user roles:

-   **Member**: The end-user of the platform. They use the app to track their health and fitness, participate in challenges, engage with the community, and consume content. Their experience should be focused on personal progress and motivation.
-   **Coach**: A professional who guides and supports a roster of members. They need tools to monitor member progress, provide personalized feedback, create custom content (like workouts and challenges), and communicate securely.
-   **Admin**: A system administrator responsible for the overall health and management of the platform. They need tools to manage user accounts (both members and coaches), oversee content, manage platform-wide settings, and monitor system health.

## 2. Main Modules

The platform will be architected around a set of core modules. Each module will have tailored experiences for the different user roles.

-   **Home**: A personalized dashboard for each user role.
    -   *Member*: Shows daily tasks, progress summary, and recent activity.
    -   *Coach*: Shows a roster of members, pending feedback requests, and high-level client engagement metrics.
    -   *Admin*: Shows platform-wide statistics, system health, and moderation queues.
-   **Coaching**: Tools for coaches to manage their clients.
    -   *Coach*: View member-specific dashboards, send private messages, and provide feedback on workouts and nutrition logs.
    -   *Member*: View feedback from their coach and communicate with them.
-   **Workouts**: Manage exercise plans and sessions.
    -   *Member*: Access personalized workouts, log sessions, and view exercise demos.
    -   *Coach*: Create and assign workout plans to members, build a library of custom exercises.
-   **Nutrition**: Manage meal logging and analysis.
    -   *Member*: Log meals (text/image), view nutritional breakdowns.
    -   *Coach*: View member nutrition logs, provide feedback and suggestions.
-   **Reports**: View and analyze data.
    -   *Member*: See personal progress over time.
    -   *Coach*: View detailed reports for individual members.
    -   *Admin*: Generate platform-wide usage and engagement reports.
-   **Community**: Foster engagement between users.
    -   *All Users*: Participate in groups and challenges, create posts, and react to content.
    -   *Coach/Admin*: Moderate content and manage groups.
-   **Store**: E-commerce functionality.
    -   *Member*: Purchase products and programs.
    -   *Coach/Admin*: Create and manage products.
-   **Settings**: Manage user and platform configurations.
    -   *Member*: Manage profile, notification preferences, and connected accounts.
    -   *Coach*: Manage public profile, billing, and client settings.
    -   *Admin*: Manage platform integrations, user roles, and system-wide settings.
-   **AgentOps**: A new module for managing the platform's AI capabilities.
    -   *Admin*: Monitor the performance of AI agents (e.g., Nutrition Coach, Workout Coach), manage prompts, and view AI interaction logs.

## 3. Success Criteria for v1

The first version of the modular platform will be considered successful when:

-   All existing functionality from the current SteadyAI application is successfully migrated to the new modular architecture without any loss of data or user-facing regressions.
-   Coaches can be invited to the platform, create a profile, and be assigned a roster of members by an Admin.
-   Coaches can view the profile, progress, workout logs, and nutrition logs of their assigned members.
-   Admins can create, view, update, and deactivate member and coach accounts.
-   The platform maintains 100% compatibility with the existing ChatGPT MCP integration.

## 4. Non-Goals for v1

The following features and capabilities are explicitly out of scope for the initial v1 release:

-   Real-time chat or video coaching sessions between members and coaches.
-   Advanced financial and analytics dashboards for coaches and admins.
-   Full white-labeling capabilities for coaches (e.g., custom branding, domain).
-   Direct member-to-coach payments or subscription management. All billing will be handled outside the platform initially.
-   Public-facing marketing or sign-up pages for the coaching platform.

## 5. Privacy and Safety Requirements

Given the sensitive nature of user health data, the platform must adhere to strict privacy and safety standards.

-   **Data Access Control**: A robust role-based access control (RBAC) system must be implemented.
    -   Coaches must only be able to view data for members explicitly assigned to them.
    -   Members' data must be considered private by default and not visible to other members, except for content explicitly shared in the Community module.
    -   Admins should have limited access to sensitive PII and health data, with access logged and audited.
-   **Data Segregation**: Ensure a clear logical separation between data for different coaches and their members.
-   **Compliance**: While full HIPAA compliance is a non-goal for v1, the architecture should be designed with future compliance in mind (e.g., audit logging for data access, data encryption at rest and in transit).

## 6. Compatibility Requirement

-   **ChatGPT MCP Integration**: The existing ChatGPT integration is a critical feature and must continue to function without interruption.
-   The API endpoints, tool definitions, and authentication mechanisms defined in `src/routes/apps-mcp.ts` must be preserved. Any changes to the underlying services that these tools depend on must be done in a backward-compatible way.

