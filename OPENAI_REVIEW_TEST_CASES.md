# OpenAI Review Test Cases

These test cases are intended for OpenAI review and are written to match the current MCP tool behavior as implemented in this repository. They are designed to be deterministic, explicit, and suitable for both ChatGPT web and mobile.

## Preconditions

- The reviewer must be signed into the pre-provisioned SteadyAI demo account before running authenticated tests.
- The SteadyAI connector/app must already be connected in ChatGPT.
- For the most reliable invocation behavior, the prompts below explicitly name the intended tool.

## Positive Test Cases

### Test Case 1

- Scenario: Generate a personalized workout card.
- User prompt: `Use steadyai.workout_coach to create a 20-minute low-impact workout for today with no equipment and show the workout card.`
- Tools triggered: `steadyai.workout_coach`
- Expected output: A workout card/widget renders with a workout title, several exercises, reps/duration, quick modify actions, and demo media or fallback labels for matched exercises. The response text should indicate the workout is ready and include approximate duration.

### Test Case 2

- Scenario: Analyze a meal without logging it.
- User prompt: `Use steadyai.nutrition_coach to analyze this meal: grilled chicken, rice, spinach, yogurt, and a banana.`
- Tools triggered: `steadyai.nutrition_coach`
- Expected output: A nutrition card/widget renders with estimated calories and macros, itemized meal analysis, and nutrition tips. The result should describe the meal analysis and not require a database write to succeed.

### Test Case 3

- Scenario: Log a meal for the authenticated user.
- User prompt: `Use steadyai.log_nutrition_intake to log this meal: oats, milk, banana, and peanut butter.`
- Tools triggered: `steadyai.log_nutrition_intake`
- Expected output: The meal is saved for the signed-in user and the response confirms logging succeeded. The returned card should include meal totals and an updated same-day summary.

### Test Case 4

- Scenario: Generate a check-in draft from workout stats.
- User prompt: `Use steadyai.generate_checkin_draft with totalDurationMinutes 20, completedExercises 4, totalExercises 4, and feedback JUST_RIGHT.`
- Tools triggered: `steadyai.generate_checkin_draft`
- Expected output: A short, supportive `CHECK_IN` draft is returned. The tool should not publish a post; it should only generate draft text and structured content.

### Test Case 5

- Scenario: Publish a community check-in post for the authenticated user.
- User prompt: `Use steadyai.create_checkin_post to publish this content: Today I finished a short low-impact workout and I am getting back into my routine.`
- Tools triggered: `steadyai.create_checkin_post`
- Expected output: The tool creates a `CHECK_IN` community post and confirms success with a created post id and timestamp.

### Test Case 6

- Scenario: Resolve authenticated user context.
- User prompt: `Use steadyai.get_current_user_context and show my current SteadyAI user context.`
- Tools triggered: `steadyai.get_current_user_context`
- Expected output: For an authenticated reviewer, the tool returns the current user id and source. If not authenticated, it should return `No user found.` rather than crashing.

### Test Case 7

- Scenario: General coaching guidance for reset/recovery.
- User prompt: `Use steadyai.ask_agent with agentType HABIT_COACH and prompt: I missed several check-ins this week and need a simple reset plan.`
- Tools triggered: `steadyai.ask_agent`
- Expected output: A coaching response and agent card/widget should be returned with supportive reset guidance. No write action should occur.

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
