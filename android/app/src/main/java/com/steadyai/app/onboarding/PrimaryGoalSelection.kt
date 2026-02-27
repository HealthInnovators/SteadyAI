package com.steadyai.app.onboarding

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

private val defaultGoals = listOf(
    "Build consistency",
    "Lose weight",
    "Gain muscle",
    "Improve energy",
    "Eat healthier"
)

data class PrimaryGoalUiState(
    val goals: List<String> = defaultGoals,
    val selectedGoal: String? = null
) {
    val canProceed: Boolean = !selectedGoal.isNullOrBlank()
}

@HiltViewModel
class PrimaryGoalViewModel @Inject constructor() : ViewModel() {
    private val _uiState = MutableStateFlow(PrimaryGoalUiState())
    val uiState: StateFlow<PrimaryGoalUiState> = _uiState.asStateFlow()

    fun onGoalSelected(goal: String) {
        _uiState.update { state ->
            if (goal in state.goals) state.copy(selectedGoal = goal) else state
        }
    }
}

@Composable
fun PrimaryGoalRoute(
    onContinue: (String) -> Unit,
    viewModel: PrimaryGoalViewModel = hiltViewModel()
) {
    val state by viewModel.uiState.collectAsState()

    PrimaryGoalScreen(
        state = state,
        onGoalSelected = viewModel::onGoalSelected,
        onContinue = {
            val goal = state.selectedGoal ?: return@PrimaryGoalScreen
            onContinue(goal)
        }
    )
}

@Composable
fun PrimaryGoalScreen(
    state: PrimaryGoalUiState,
    onGoalSelected: (String) -> Unit,
    onContinue: () -> Unit
) {
    Surface(modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                text = "What is your primary goal?",
                style = MaterialTheme.typography.headlineSmall
            )
            Text(
                text = "Select one option to continue.",
                style = MaterialTheme.typography.bodyMedium
            )

            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(state.goals) { goal ->
                    GoalOptionRow(
                        goal = goal,
                        selected = state.selectedGoal == goal,
                        onSelect = { onGoalSelected(goal) }
                    )
                }
            }

            Button(
                onClick = onContinue,
                enabled = state.canProceed,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Continue")
            }
        }
    }
}

@Composable
private fun GoalOptionRow(
    goal: String,
    selected: Boolean,
    onSelect: () -> Unit
) {
    Button(
        onClick = onSelect,
        modifier = Modifier.fillMaxWidth()
    ) {
        RadioButton(
            selected = selected,
            onClick = null
        )
        Text(
            text = goal,
            modifier = Modifier.padding(start = 8.dp)
        )
    }
}
