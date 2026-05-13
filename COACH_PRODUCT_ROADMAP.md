# Steady AI Product Roadmap

## Goal
Build Steady AI as a simple, intent-led conversational app with rich interactive UI for:
- Fitness coaching and tracking
- Nutrition coaching and tracking
- Report generation
- Community engagement
- Optional store recommendations

## North-Star Experience
- One conversational home interface with rich cards and quick actions.
- Assistant identifies user intent and routes to the right interactive section.
- Minimal taps for core actions (log, adjust, save, review).

## Phase 1 (In Progress): Intent-Led Hub
- Add explicit assistant intent classification in backend responses.
- Auto-handoff from assistant conversation to hub sections (fitness/check-in/community/reports/store).
- Expand starter prompts and quick actions for faster first interaction.
- Keep onboarding lightweight while exposing assistant + fitness previews immediately.

## Phase 2: Tracking Layer
- Fitness:
  - Session planner + save session + perceived difficulty feedback.
  - Health Connect aggregation ingestion and daily sync status.
- Nutrition:
  - Meal logging (manual + AI estimate) with quick-add cards.
  - Daily macro and calorie targets with progress indicators.
- Privacy:
  - Consent controls and aggregated-data-first storage defaults.

## Phase 3: Report Engine
- Daily and weekly report generation from:
  - check-ins, workout summaries, nutrition logs, community activity.
- Conversational report requests:
  - "summarize my week", "what should I improve next week?"
- Visual trend cards and one clear, supportive suggestion per report.

## Phase 4: Community + Store Polish
- Community:
  - guided post/reply drafting in-line from assistant.
  - anti-spam notification behavior and healthy engagement nudges.
- Store:
  - optional product recommendations based on MCP-safe summary.
  - transparent "who it's for / not for" and no urgency patterns.

## Success Metrics
- Time to first meaningful action < 60 seconds.
- % sessions with at least one logged action (fitness/nutrition/check-in).
- Weekly report open rate.
- Community participation rate (post/reply/react).
- Store suggestion acceptance without negative UX feedback.
