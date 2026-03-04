package com.steadyai.app.health

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.health.connect.client.PermissionController
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.steadyai.app.session.SessionManager
import com.steadyai.core.model.health.HealthConnectSummaryRequest
import com.steadyai.core.model.health.HealthConnectSummaryResponse
import com.steadyai.core.network.api.ApiService
import com.steadyai.core.network.client.ApiClient
import com.steadyai.core.network.model.ApiResult
import dagger.hilt.android.lifecycle.HiltViewModel
import java.time.Instant
import java.time.ZoneOffset
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class HealthConnectUiState(
    val isCheckingPermissions: Boolean = true,
    val hasPermissions: Boolean = false,
    val isSyncing: Boolean = false,
    val message: String? = null,
    val error: String? = null,
    val latestSummary: AggregatedHealthSummary? = null,
    val latestServerSync: HealthConnectSummaryResponse? = null
)

@HiltViewModel
class HealthConnectViewModel @Inject constructor(
    private val healthService: HealthConnectSummaryService,
    private val apiService: ApiService,
    private val apiClient: ApiClient,
    private val sessionManager: SessionManager
) : ViewModel() {
    private val _uiState = MutableStateFlow(HealthConnectUiState())
    val uiState: StateFlow<HealthConnectUiState> = _uiState.asStateFlow()

    fun requiredPermissions(): Set<String> = healthService.requiredReadPermissions()

    fun refreshPermissionState() {
        viewModelScope.launch {
            _uiState.update { it.copy(isCheckingPermissions = true, error = null) }
            val result = healthService.hasRequiredPermissions()
            if (result.isSuccess) {
                _uiState.update {
                    it.copy(
                        isCheckingPermissions = false,
                        hasPermissions = result.getOrNull() == true
                    )
                }
            } else {
                _uiState.update {
                    it.copy(
                        isCheckingPermissions = false,
                        hasPermissions = false,
                        error = result.exceptionOrNull()?.message ?: "Failed to check permissions"
                    )
                }
            }
        }
    }

    fun onPermissionsResult(grantedPermissions: Set<String>) {
        val granted = grantedPermissions.containsAll(requiredPermissions())
        _uiState.update {
            it.copy(
                hasPermissions = granted,
                error = if (granted) null else "Health Connect permissions are required to sync summaries."
            )
        }
    }

    fun syncLast24Hours() {
        val userId = sessionManager.getCurrentUserIdOrNull()
        if (userId.isNullOrBlank()) {
            _uiState.update {
                it.copy(error = "Complete onboarding first so we can attach this summary to your profile.")
            }
            return
        }

        viewModelScope.launch {
            _uiState.update { it.copy(isSyncing = true, error = null, message = null) }

            val windowEnd = Instant.now()
            val windowStart = windowEnd.minusSeconds(24 * 60 * 60)

            val summaryResult = healthService.fetchAggregatedMetrics(windowStart, windowEnd)
            val summary = summaryResult.getOrElse { error ->
                _uiState.update {
                    it.copy(
                        isSyncing = false,
                        error = error.message ?: "Failed to fetch Health Connect aggregates."
                    )
                }
                return@launch
            }

            healthService.storeAggregatedSummary(summary).onFailure { storageError ->
                _uiState.update {
                    it.copy(error = storageError.message ?: "Failed to store local aggregate summary.")
                }
            }

            val request = HealthConnectSummaryRequest(
                userId = userId,
                date = summary.windowEnd.atOffset(ZoneOffset.UTC).toLocalDate().toString(),
                steps = summary.totalSteps,
                activityMinutes = summary.activeMinutes,
                sourceApp = summary.source
            )

            when (val syncResult = apiClient.execute { apiService.submitHealthConnectSummary(request) }) {
                is ApiResult.Success -> {
                    _uiState.update {
                        it.copy(
                            isSyncing = false,
                            latestSummary = summary,
                            latestServerSync = syncResult.data,
                            message = "Health Connect summary synced successfully.",
                            error = null
                        )
                    }
                }

                is ApiResult.Failure -> {
                    _uiState.update {
                        it.copy(
                            isSyncing = false,
                            latestSummary = summary,
                            error = syncResult.error.message
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun HealthConnectRoute(
    viewModel: HealthConnectViewModel = hiltViewModel()
) {
    val state by viewModel.uiState.collectAsState()
    val permissions = viewModel.requiredPermissions()

    val permissionsLauncher = rememberLauncherForActivityResult(
        contract = PermissionController.createRequestPermissionResultContract()
    ) { granted ->
        viewModel.onPermissionsResult(granted)
    }

    LaunchedEffect(Unit) {
        viewModel.refreshPermissionState()
    }

    HealthConnectScreen(
        state = state,
        onRequestPermissions = {
            permissionsLauncher.launch(permissions)
        },
        onSync = viewModel::syncLast24Hours,
        onRefreshPermissions = viewModel::refreshPermissionState
    )
}

@Composable
fun HealthConnectScreen(
    state: HealthConnectUiState,
    onRequestPermissions: () -> Unit,
    onSync: () -> Unit,
    onRefreshPermissions: () -> Unit
) {
    Surface(modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            Text(
                text = "Health Connect",
                style = MaterialTheme.typography.headlineSmall
            )
            Text(
                text = "Connect Health Connect, read aggregated metrics for the last 24 hours, and sync aggregated-only data.",
                style = MaterialTheme.typography.bodyMedium
            )

            when {
                state.isCheckingPermissions -> {
                    CircularProgressIndicator()
                    Text("Checking Health Connect permissions...")
                }

                !state.hasPermissions -> {
                    Text(
                        text = "Permissions not granted.",
                        color = MaterialTheme.colorScheme.error
                    )
                    Button(onClick = onRequestPermissions) {
                        Text("Grant Health Connect Permissions")
                    }
                    OutlinedButton(onClick = onRefreshPermissions) {
                        Text("Refresh Permission Status")
                    }
                }

                else -> {
                    Text(
                        text = "Permissions granted.",
                        color = MaterialTheme.colorScheme.primary
                    )
                    Button(
                        onClick = onSync,
                        enabled = !state.isSyncing
                    ) {
                        if (state.isSyncing) {
                            CircularProgressIndicator(
                                modifier = Modifier
                                    .padding(end = 8.dp)
                                    .size(16.dp),
                                strokeWidth = 2.dp
                            )
                            Text("Syncing...")
                        } else {
                            Text("Sync Last 24 Hours")
                        }
                    }
                }
            }

            state.message?.let { message ->
                Text(
                    text = message,
                    color = MaterialTheme.colorScheme.primary
                )
            }

            state.error?.let { error ->
                Text(
                    text = error,
                    color = MaterialTheme.colorScheme.error
                )
            }

            state.latestSummary?.let { summary ->
                Text("Latest local summary", style = MaterialTheme.typography.titleMedium)
                Text("Steps: ${summary.totalSteps}")
                Text("Active minutes: ${summary.activeMinutes}")
                Text("Sleep minutes: ${summary.sleepMinutes}")
            }

            state.latestServerSync?.let { sync ->
                Text("Last backend sync", style = MaterialTheme.typography.titleMedium)
                Text("Date: ${sync.date}")
                Text("Records upserted: ${sync.recordsUpserted}")
                Text("Synced steps: ${sync.summary.steps}")
                Text("Synced active minutes: ${sync.summary.activityMinutes}")
            }
        }
    }
}
