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
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.steadyai.core.model.onboarding.OnboardingRequest
import com.steadyai.core.model.onboarding.OnboardingResponse
import com.steadyai.core.network.api.ApiService
import com.steadyai.core.network.client.ApiClient
import com.steadyai.core.network.model.ApiResult
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

private val primaryGoalOptions = listOf(
    "Build consistency",
    "Improve nutrition habits",
    "Increase energy for daily life",
    "Stay accountable with community"
)

private val experienceLevelOptions = listOf(
    "Beginner",
    "Intermediate",
    "Advanced"
)

private val dietaryPreferenceOptions = listOf(
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

data class OnboardingSubmissionUiState(
    val primaryGoal: String? = null,
    val experienceLevel: String? = null,
    val dietaryPreferences: Set<String> = emptySet(),
    val timeAvailability: String? = null,
    val primaryGoalError: String? = null,
    val experienceLevelError: String? = null,
    val dietaryPreferencesError: String? = null,
    val timeAvailabilityError: String? = null,
    val submitErrorMessage: String? = null,
    val isSubmitting: Boolean = false,
    val result: OnboardingResponse? = null
) {
    val isSubmitted: Boolean = result != null
    val isFormValid: Boolean =
        !primaryGoal.isNullOrBlank() &&
            !experienceLevel.isNullOrBlank() &&
            dietaryPreferences.isNotEmpty() &&
            !timeAvailability.isNullOrBlank()
}

sealed interface OnboardingSubmissionEvent {
    data object Submitted : OnboardingSubmissionEvent
}

@HiltViewModel
class OnboardingSubmissionViewModel @Inject constructor(
    private val apiService: ApiService,
    private val apiClient: ApiClient
) : ViewModel() {
    private val _uiState = MutableStateFlow(OnboardingSubmissionUiState())
    val uiState: StateFlow<OnboardingSubmissionUiState> = _uiState.asStateFlow()

    private val _events = MutableSharedFlow<OnboardingSubmissionEvent>()
    val events: SharedFlow<OnboardingSubmissionEvent> = _events.asSharedFlow()

    fun selectPrimaryGoal(goal: String) {
        _uiState.update {
            it.copy(
                primaryGoal = goal,
                primaryGoalError = null,
                submitErrorMessage = null
            )
        }
    }

    fun selectExperienceLevel(level: String) {
        _uiState.update {
            it.copy(
                experienceLevel = level,
                experienceLevelError = null,
                submitErrorMessage = null
            )
        }
    }

    fun toggleDietaryPreference(preference: String) {
        _uiState.update { current ->
            val updated = current.dietaryPreferences.toMutableSet()
            if (!updated.add(preference)) {
                updated.remove(preference)
            }
            current.copy(
                dietaryPreferences = updated,
                dietaryPreferencesError = null,
                submitErrorMessage = null
            )
        }
    }

    fun selectTimeAvailability(value: String) {
        _uiState.update {
            it.copy(
                timeAvailability = value,
                timeAvailabilityError = null,
                submitErrorMessage = null
            )
        }
    }

    fun submit() {
        val snapshot = uiState.value
        val validated = validate(snapshot)
        if (!validated.isValid) {
            _uiState.update {
                it.copy(
                    primaryGoalError = validated.primaryGoalError,
                    experienceLevelError = validated.experienceLevelError,
                    dietaryPreferencesError = validated.dietaryPreferencesError,
                    timeAvailabilityError = validated.timeAvailabilityError,
                    submitErrorMessage = "Please complete all required fields."
                )
            }
            return
        }

        val request = OnboardingRequest(
            primaryGoal = snapshot.primaryGoal.orEmpty(),
            experienceLevel = snapshot.experienceLevel.orEmpty(),
            dietaryPreferences = snapshot.dietaryPreferences.toList().sorted(),
            timeAvailability = snapshot.timeAvailability.orEmpty()
        )

        viewModelScope.launch {
            _uiState.update {
                it.copy(
                    isSubmitting = true,
                    submitErrorMessage = null
                )
            }

            when (val response = apiClient.execute { apiService.submitOnboarding(request) }) {
                is ApiResult.Success -> {
                    _uiState.update {
                        it.copy(
                            isSubmitting = false,
                            result = response.data,
                            submitErrorMessage = null
                        )
                    }
                    _events.emit(OnboardingSubmissionEvent.Submitted)
                }

                is ApiResult.Failure -> {
                    _uiState.update {
                        it.copy(
                            isSubmitting = false,
                            submitErrorMessage = response.error.message
                        )
                    }
                }
            }
        }
    }

    private fun validate(state: OnboardingSubmissionUiState): ValidationResult {
        val primaryGoalError = if (state.primaryGoal.isNullOrBlank()) "Primary goal is required." else null
        val experienceLevelError = if (state.experienceLevel.isNullOrBlank()) "Experience level is required." else null
        val dietaryPreferencesError = if (state.dietaryPreferences.isEmpty()) "Select at least one dietary preference." else null
        val timeAvailabilityError = if (state.timeAvailability.isNullOrBlank()) "Time availability is required." else null

        return ValidationResult(
            primaryGoalError = primaryGoalError,
            experienceLevelError = experienceLevelError,
            dietaryPreferencesError = dietaryPreferencesError,
            timeAvailabilityError = timeAvailabilityError
        )
    }
}

private data class ValidationResult(
    val primaryGoalError: String?,
    val experienceLevelError: String?,
    val dietaryPreferencesError: String?,
    val timeAvailabilityError: String?
) {
    val isValid: Boolean
        get() = primaryGoalError == null &&
            experienceLevelError == null &&
            dietaryPreferencesError == null &&
            timeAvailabilityError == null
}

@Composable
fun OnboardingSubmissionRoute(
    onSubmitted: () -> Unit = {},
    viewModel: OnboardingSubmissionViewModel = hiltViewModel()
) {
    val state by viewModel.uiState.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.events.collect { event ->
            if (event is OnboardingSubmissionEvent.Submitted) {
                onSubmitted()
            }
        }
    }

    OnboardingSubmissionScreen(
        state = state,
        onSelectPrimaryGoal = viewModel::selectPrimaryGoal,
        onSelectExperienceLevel = viewModel::selectExperienceLevel,
        onToggleDietaryPreference = viewModel::toggleDietaryPreference,
        onSelectTimeAvailability = viewModel::selectTimeAvailability,
        onSubmit = viewModel::submit
    )
}

@Composable
fun OnboardingSubmissionScreen(
    state: OnboardingSubmissionUiState,
    onSelectPrimaryGoal: (String) -> Unit,
    onSelectExperienceLevel: (String) -> Unit,
    onToggleDietaryPreference: (String) -> Unit,
    onSelectTimeAvailability: (String) -> Unit,
    onSubmit: () -> Unit
) {
    if (state.isSubmitted) {
        OnboardingSubmittedContent(result = state.result)
        return
    }

    Surface(modifier = Modifier.fillMaxSize()) {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(18.dp)
        ) {
            item {
                Text(
                    text = "Complete your onboarding",
                    style = MaterialTheme.typography.headlineSmall
                )
            }

            item {
                RadioGroupSection(
                    title = "Primary goal",
                    options = primaryGoalOptions,
                    selected = state.primaryGoal,
                    onSelect = onSelectPrimaryGoal
                )
                state.primaryGoalError?.let { FieldError(message = it) }
            }

            item {
                RadioGroupSection(
                    title = "Experience level",
                    options = experienceLevelOptions,
                    selected = state.experienceLevel,
                    onSelect = onSelectExperienceLevel
                )
                state.experienceLevelError?.let { FieldError(message = it) }
            }

            item {
                DietaryPreferencesSection(
                    selected = state.dietaryPreferences,
                    onToggle = onToggleDietaryPreference
                )
                state.dietaryPreferencesError?.let { FieldError(message = it) }
            }

            item {
                RadioGroupSection(
                    title = "Time availability",
                    options = timeAvailabilityOptions,
                    selected = state.timeAvailability,
                    onSelect = onSelectTimeAvailability
                )
                state.timeAvailabilityError?.let { FieldError(message = it) }
            }

            item {
                state.submitErrorMessage?.let {
                    Text(
                        text = it,
                        color = MaterialTheme.colorScheme.error,
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                }

                Button(
                    onClick = onSubmit,
                    enabled = !state.isSubmitting,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    if (state.isSubmitting) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(18.dp),
                            strokeWidth = 2.dp
                        )
                    } else {
                        Text("Submit onboarding")
                    }
                }
            }
        }
    }
}

@Composable
private fun RadioGroupSection(
    title: String,
    options: List<String>,
    selected: String?,
    onSelect: (String) -> Unit
) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(
            text = title,
            style = MaterialTheme.typography.titleMedium
        )

        options.forEach { option ->
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                RadioButton(
                    selected = selected == option,
                    onClick = { onSelect(option) }
                )
                Text(option)
            }
        }
    }
}

@Composable
private fun DietaryPreferencesSection(
    selected: Set<String>,
    onToggle: (String) -> Unit
) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(
            text = "Dietary preferences",
            style = MaterialTheme.typography.titleMedium
        )
        Text(
            text = "Select one or more options.",
            style = MaterialTheme.typography.bodyMedium
        )

        dietaryPreferenceOptions.forEach { preference ->
            FilterChip(
                selected = preference in selected,
                onClick = { onToggle(preference) },
                label = { Text(preference) },
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}

@Composable
private fun FieldError(message: String) {
    Text(
        text = message,
        color = MaterialTheme.colorScheme.error,
        style = MaterialTheme.typography.bodySmall
    )
}

@Composable
private fun OnboardingSubmittedContent(result: OnboardingResponse?) {
    Surface(modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "Onboarding submitted",
                style = MaterialTheme.typography.headlineSmall
            )
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = result?.username?.let { "Welcome, $it." } ?: "Your onboarding profile is saved.",
                style = MaterialTheme.typography.bodyLarge
            )
        }
    }
}
