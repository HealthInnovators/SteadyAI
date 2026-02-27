package com.steadyai.app.checkin

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.steadyai.core.model.challenge.ChallengeCheckInRequest
import com.steadyai.core.model.challenge.ChallengeCheckInResponse
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

enum class CheckInStatus { COMPLETED, PARTIAL, SKIPPED }

data class CheckInUiState(
    val loading: Boolean = false,
    val submittingStatus: CheckInStatus? = null,
    val latestStatus: CheckInStatus? = null,
    val confirmationMessage: String? = null,
    val error: String? = null,
    val summary: ChallengeCheckInResponse? = null
)

@HiltViewModel
class CheckInViewModel @Inject constructor(
    private val apiService: ApiService,
    private val apiClient: ApiClient
) : ViewModel() {
    private val _uiState = MutableStateFlow(CheckInUiState())
    val uiState: StateFlow<CheckInUiState> = _uiState.asStateFlow()

    fun submitCheckIn(status: CheckInStatus) {
        viewModelScope.launch {
            _uiState.update {
                it.copy(
                    loading = true,
                    submittingStatus = status,
                    error = null,
                    confirmationMessage = null
                )
            }
            when (val result = apiClient.execute { apiService.submitCheckIn(ChallengeCheckInRequest(status = status.name)) }) {
                is ApiResult.Success -> _uiState.update {
                    it.copy(
                        loading = false,
                        submittingStatus = null,
                        latestStatus = status,
                        confirmationMessage = supportiveCopyFor(status),
                        summary = result.data
                    )
                }

                is ApiResult.Failure -> _uiState.update {
                    it.copy(
                        loading = false,
                        submittingStatus = null,
                        error = result.error.message
                    )
                }
            }
        }
    }

    private fun supportiveCopyFor(status: CheckInStatus): String {
        return when (status) {
            CheckInStatus.COMPLETED -> "Nice work. You completed today's challenge and kept your momentum going."
            CheckInStatus.PARTIAL -> "Good progress. A partial day still counts as consistency."
            CheckInStatus.SKIPPED -> "Thanks for checking in. Tomorrow is a fresh start and we're with you."
        }
    }
}

@Composable
fun CheckInScreen(viewModel: CheckInViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsState()

    Surface(modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text("Daily Check-in", style = MaterialTheme.typography.titleLarge)
            Text(
                "How did today's challenge go? A quick check-in helps you stay consistent.",
                style = MaterialTheme.typography.bodyMedium
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                CheckInStatus.entries.forEach { status ->
                    val isSubmitting = state.loading && state.submittingStatus == status
                    val wasSelected = state.latestStatus == status

                    Button(
                        onClick = { viewModel.submitCheckIn(status) },
                        enabled = !state.loading,
                        modifier = Modifier.weight(1f),
                        colors = if (wasSelected) {
                            ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                        } else {
                            ButtonDefaults.buttonColors()
                        }
                    ) {
                        Text(
                            when {
                                isSubmitting -> "Saving..."
                                else -> status.label()
                            }
                        )
                    }
                }
            }

            state.confirmationMessage?.let { message ->
                Card(modifier = Modifier.fillMaxWidth()) {
                    Column(
                        modifier = Modifier.padding(12.dp),
                        verticalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text("Check-in saved", style = MaterialTheme.typography.titleMedium)
                        Text(message, style = MaterialTheme.typography.bodyMedium)
                    }
                }
            }

            state.error?.let {
                Text(it, color = MaterialTheme.colorScheme.error)
            }

            state.summary?.let { summary ->
                Card(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text("Challenge: ${summary.challengeId}")
                        Text("Total: ${summary.counts.total}")
                        Text("Completed: ${summary.counts.completed}")
                        Text("Partial: ${summary.counts.partial}")
                        Text("Skipped: ${summary.counts.skipped}")
                    }
                }
            }
        }
    }
}

private fun CheckInStatus.label(): String {
    return when (this) {
        CheckInStatus.COMPLETED -> "Completed"
        CheckInStatus.PARTIAL -> "Partial"
        CheckInStatus.SKIPPED -> "Skipped"
    }
}
