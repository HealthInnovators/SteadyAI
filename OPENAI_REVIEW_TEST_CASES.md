# OpenAI Review Test Cases

These test cases are intended for OpenAI review and are written to match the current MCP behavior in this repository. They are designed to be deterministic, explicit, and stable across ChatGPT web and mobile.

## Review Guidance

- Prefer evaluating successful tool output over widget rendering details.
- Do not make visual card rendering the required success condition for a test.
- Do not rely on authenticated database writes for the primary approval test set.
- When possible, use explicit tool names in prompts to reduce invocation ambiguity.

## Preconditions

- The SteadyAI connector/app must already be connected in ChatGPT.
- For most tools, the user must be authenticated. Some discovery and read tools may function without authentication.

## Positive Test Cases

### Test Case 1

- Scenario: Confirm the SteadyAI MCP server exposes its tool catalog.
- User prompt: `List the SteadyAI tools available in this app.`
- Tools triggered: MCP `tools/list`
- Expected output: The MCP server returns the tool catalog successfully. The result should include tools such as `steadyai.workout_coach`, `steadyai.nutrition_coach`, `steadyai.ask_agent`, and `steadyai.generate_checkin_draft`.

### Test Case 2

- Scenario: Generate a workout plan without requiring a write action.
- User prompt: `Use steadyai.workout_coach to create a 20-minute low-impact workout for today with no equipment.`
- Tools triggered: `steadyai.workout_coach`
- Expected output: A structured workout plan is returned with a workout title, multiple exercises, reps or durations, and an approximate total duration. The required success condition is a valid workout plan response.

### Test Case 3

- Scenario: Analyze a meal without logging it.
- User prompt: `Use steadyai.nutrition_coach to analyze this meal: grilled chicken, rice, spinach, yogurt, and a banana.`
- Tools triggered: `steadyai.nutrition_coach`
- Expected output: A nutrition analysis is returned with estimated calories, macros, an itemized meal analysis, and guidance or suggestions. The required success condition is a valid nutrition-analysis response.

### Test Case 4

- Scenario: Generate a check-in draft.
- User prompt: `Use steadyai.generate_checkin_draft with totalDurationMinutes 20, completedExercises 4, totalExercises 4, and feedback JUST_RIGHT.`
- Tools triggered: `steadyai.generate_checkin_draft`
- Expected output: A short supportive `CHECK_IN` draft is returned as text and structured draft content. This tool requires the user to be authenticated.

### Test Case 5

- Scenario: Generate general reset coaching guidance.
- User prompt: `Use steadyai.ask_agent with agentType HABIT_COACH and prompt: I missed several check-ins this week and need a simple reset plan.`
- Tools triggered: `steadyai.ask_agent`
- Expected output: A supportive coaching response is returned with concrete reset guidance.

### Test Case 6

- Scenario: Read the workout widget resource directly.
- User prompt: `Load the SteadyAI workout widget resource.`
- Tools triggered: MCP `resources/read`
- Expected output: The workout widget HTML resource is returned successfully. This is a deterministic resource-read check.

## Negative Test Cases

### Negative Test Case 1

- Scenario: General knowledge question unrelated to SteadyAI.
- User prompt: `Who won the FIFA World Cup in 2018?`
- Expected behavior: The SteadyAI app should not trigger.

### Negative Test Case 2

- Scenario: Programming request unrelated to health, fitness, nutrition, or community support.
- User prompt: `Help me fix a TypeScript error in my React app.`
- Expected behavior: The SteadyAI app should not trigger.

### Negative Test Case 3

- Scenario: Travel planning request unrelated to SteadyAI.
- User prompt: `Find me the cheapest flights from New York to San Francisco next weekend.`
- Expected behavior: The SteadyAI app should not trigger.
