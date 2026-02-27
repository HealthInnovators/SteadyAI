package com.steadyai.app.onboarding

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.steadyai.core.model.onboarding.OnboardingRequest
import com.steadyai.core.model.onboarding.OnboardingResponse
import com.steadyai.core.network.api.ApiService
import com.steadyai.core.network.client.ApiClient
import com.steadyai.core.network.model.ApiResult
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

enum class OnboardingStep(val index: Int) {
    GOAL(0),
    EXPERIENCE(1),
    DIETARY(2),
    TIME(3)
}

data class OnboardingUiState(
    val currentStep: OnboardingStep = OnboardingStep.GOAL,
    val primaryGoal: String? = null,
    val experienceLevel: String? = null,
    val dietaryPreferences: Set<String> = emptySet(),
    val timeAvailability: String? = null,
    val isSubmitting: Boolean = false,
    val isCompleted: Boolean = false,
    val errorMessage: String? = null,
    val result: OnboardingResponse? = null
) {
    val progress: Float = (currentStep.index + 1) / 4f
}

@HiltViewModel
class OnboardingViewModel @Inject constructor(
    private val apiService: ApiService,
    private val apiClient: ApiClient
) : ViewModel() {
    private val _uiState = MutableStateFlow(OnboardingUiState())
    val uiState: StateFlow<OnboardingUiState> = _uiState.asStateFlow()

    fun selectGoal(goal: String) {
        _uiState.update { it.copy(primaryGoal = goal, errorMessage = null) }
    }

    fun selectExperienceLevel(level: String) {
        _uiState.update { it.copy(experienceLevel = level, errorMessage = null) }
    }

    fun toggleDietaryPreference(preference: String) {
        _uiState.update { current ->
            val updated = current.dietaryPreferences.toMutableSet()
            if (!updated.add(preference)) {
                updated.remove(preference)
            }
            current.copy(dietaryPreferences = updated, errorMessage = null)
        }
    }

    fun selectTimeAvailability(value: String) {
        _uiState.update { it.copy(timeAvailability = value, errorMessage = null) }
    }

    fun nextStep() {
        _uiState.update { state ->
            val next = when (state.currentStep) {
                OnboardingStep.GOAL -> OnboardingStep.EXPERIENCE
                OnboardingStep.EXPERIENCE -> OnboardingStep.DIETARY
                OnboardingStep.DIETARY -> OnboardingStep.TIME
                OnboardingStep.TIME -> OnboardingStep.TIME
            }
            state.copy(currentStep = next)
        }
    }

    fun previousStep() {
        _uiState.update { state ->
            val prev = when (state.currentStep) {
                OnboardingStep.GOAL -> OnboardingStep.GOAL
                OnboardingStep.EXPERIENCE -> OnboardingStep.GOAL
                OnboardingStep.DIETARY -> OnboardingStep.EXPERIENCE
                OnboardingStep.TIME -> OnboardingStep.DIETARY
            }
            state.copy(currentStep = prev)
        }
    }

    fun submit() {
        val snapshot = uiState.value
        val request = OnboardingRequest(
            primaryGoal = snapshot.primaryGoal.orEmpty(),
            experienceLevel = snapshot.experienceLevel.orEmpty(),
            dietaryPreferences = snapshot.dietaryPreferences.toList().sorted(),
            timeAvailability = snapshot.timeAvailability.orEmpty()
        )

        if (!canSubmit(snapshot)) {
            _uiState.update { it.copy(errorMessage = "Please complete all onboarding steps.") }
            return
        }

        viewModelScope.launch {
            _uiState.update { it.copy(isSubmitting = true, errorMessage = null) }
            when (val result = apiClient.execute { apiService.submitOnboarding(request) }) {
                is ApiResult.Success -> {
                    _uiState.update {
                        it.copy(
                            isSubmitting = false,
                            isCompleted = true,
                            result = result.data,
                            errorMessage = null
                        )
                    }
                }
                is ApiResult.Failure -> {
                    _uiState.update {
                        it.copy(
                            isSubmitting = false,
                            errorMessage = result.error.message
                        )
                    }
                }
            }
        }
    }

    fun isStepValid(step: OnboardingStep = uiState.value.currentStep): Boolean {
        val state = uiState.value
        return when (step) {
            OnboardingStep.GOAL -> !state.primaryGoal.isNullOrBlank()
            OnboardingStep.EXPERIENCE -> !state.experienceLevel.isNullOrBlank()
            OnboardingStep.DIETARY -> state.dietaryPreferences.isNotEmpty()
            OnboardingStep.TIME -> !state.timeAvailability.isNullOrBlank()
        }
    }

    private fun canSubmit(state: OnboardingUiState): Boolean {
        return !state.primaryGoal.isNullOrBlank() &&
            !state.experienceLevel.isNullOrBlank() &&
            state.dietaryPreferences.isNotEmpty() &&
            !state.timeAvailability.isNullOrBlank()
    }
}
