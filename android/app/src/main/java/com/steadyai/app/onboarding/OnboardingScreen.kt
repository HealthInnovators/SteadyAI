package com.steadyai.app.onboarding

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel

private val goals = listOf(
    "Build consistency",
    "Improve nutrition habits",
    "Increase energy for daily life",
    "Stay accountable with community"
)

private val experienceLevels = listOf(
    "Beginner",
    "Intermediate",
    "Advanced"
)

private val dietaryPreferences = listOf(
    "No preference",
    "Vegetarian",
    "Vegan",
    "High protein",
    "Low carb",
    "Gluten free"
)

private val timeAvailabilityOptions = listOf(
    "10-15 minutes/day",
    "20-30 minutes/day",
    "30-45 minutes/day",
    "60+ minutes/day"
)

@Composable
fun OnboardingRoute(
    viewModel: OnboardingViewModel = hiltViewModel(),
    onComplete: () -> Unit = {}
) {
    val state by viewModel.uiState.collectAsState()

    if (state.isCompleted) {
        OnboardingCompletion(
            userName = state.result?.username,
            onContinue = onComplete
        )
        return
    }

    OnboardingScreen(
        state = state,
        onSelectGoal = viewModel::selectGoal,
        onSelectExperience = viewModel::selectExperienceLevel,
        onToggleDietary = viewModel::toggleDietaryPreference,
        onSelectTime = viewModel::selectTimeAvailability,
        onBack = viewModel::previousStep,
        onNext = {
            if (state.currentStep == OnboardingStep.TIME) {
                viewModel.submit()
            } else {
                viewModel.nextStep()
            }
        },
        canProceed = viewModel.isStepValid()
    )
}

@Composable
fun OnboardingScreen(
    state: OnboardingUiState,
    onSelectGoal: (String) -> Unit,
    onSelectExperience: (String) -> Unit,
    onToggleDietary: (String) -> Unit,
    onSelectTime: (String) -> Unit,
    onBack: () -> Unit,
    onNext: () -> Unit,
    canProceed: Boolean
) {
    Surface(modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                text = "Quick setup (under 3 minutes)",
                style = MaterialTheme.typography.headlineSmall
            )
            Text(
                text = "Step ${state.currentStep.index + 1} of 4",
                style = MaterialTheme.typography.bodyMedium,
                modifier = Modifier.semantics { contentDescription = "Onboarding progress text" }
            )
            LinearProgressIndicator(
                progress = { state.progress },
                modifier = Modifier
                    .fillMaxWidth()
                    .semantics { contentDescription = "Onboarding progress indicator" }
            )

            when (state.currentStep) {
                OnboardingStep.GOAL -> GoalSelectionStep(
                    selected = state.primaryGoal,
                    onSelected = onSelectGoal
                )

                OnboardingStep.EXPERIENCE -> ExperienceLevelStep(
                    selected = state.experienceLevel,
                    onSelected = onSelectExperience
                )

                OnboardingStep.DIETARY -> DietaryPreferencesStep(
                    selected = state.dietaryPreferences,
                    onToggle = onToggleDietary
                )

                OnboardingStep.TIME -> TimeAvailabilityStep(
                    selected = state.timeAvailability,
                    onSelected = onSelectTime
                )
            }

            state.errorMessage?.let { error ->
                Text(
                    text = error,
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodyMedium
                )
            }

            Spacer(modifier = Modifier.weight(1f))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Button(
                    onClick = onBack,
                    enabled = state.currentStep != OnboardingStep.GOAL && !state.isSubmitting,
                    modifier = Modifier.semantics { contentDescription = "Back button" }
                ) {
                    Text("Back")
                }

                Button(
                    onClick = onNext,
                    enabled = canProceed && !state.isSubmitting,
                    modifier = Modifier.semantics {
                        contentDescription = if (state.currentStep == OnboardingStep.TIME) {
                            "Finish onboarding"
                        } else {
                            "Next step"
                        }
                    }
                ) {
                    if (state.isSubmitting) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(18.dp),
                            strokeWidth = 2.dp
                        )
                    } else {
                        Text(if (state.currentStep == OnboardingStep.TIME) "Finish" else "Next")
                    }
                }
            }
        }
    }
}

@Composable
private fun GoalSelectionStep(
    selected: String?,
    onSelected: (String) -> Unit
) {
    StepRadioList(
        title = "What is your primary goal?",
        options = goals,
        selected = selected,
        onSelected = onSelected
    )
}

@Composable
private fun ExperienceLevelStep(
    selected: String?,
    onSelected: (String) -> Unit
) {
    StepRadioList(
        title = "What is your current experience level?",
        options = experienceLevels,
        selected = selected,
        onSelected = onSelected
    )
}

@Composable
private fun TimeAvailabilityStep(
    selected: String?,
    onSelected: (String) -> Unit
) {
    StepRadioList(
        title = "How much time can you usually commit?",
        options = timeAvailabilityOptions,
        selected = selected,
        onSelected = onSelected
    )
}

@Composable
private fun StepRadioList(
    title: String,
    options: List<String>,
    selected: String?,
    onSelected: (String) -> Unit
) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text(
            text = title,
            style = MaterialTheme.typography.titleMedium
        )

        options.forEach { option ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 2.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                RadioButton(
                    selected = option == selected,
                    onClick = { onSelected(option) }
                )
                Text(text = option)
            }
        }
    }
}

@Composable
private fun DietaryPreferencesStep(
    selected: Set<String>,
    onToggle: (String) -> Unit
) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text(
            text = "Select dietary preferences",
            style = MaterialTheme.typography.titleMedium
        )
        Text(
            text = "Pick one or more options.",
            style = MaterialTheme.typography.bodyMedium
        )

        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(dietaryPreferences) { pref ->
                FilterChip(
                    selected = pref in selected,
                    onClick = { onToggle(pref) },
                    label = { Text(pref) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .semantics { contentDescription = "Dietary preference $pref" }
                )
            }
        }
    }
}

@Composable
private fun OnboardingCompletion(
    userName: String?,
    onContinue: () -> Unit
) {
    Surface(modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "You are all set${userName?.let { ", $it" } ?: ""}.",
                style = MaterialTheme.typography.headlineSmall
            )
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "Your onboarding profile has been saved.",
                style = MaterialTheme.typography.bodyLarge
            )
            Spacer(modifier = Modifier.height(24.dp))
            Button(onClick = onContinue) {
                Text("Continue")
            }
        }
    }
}
