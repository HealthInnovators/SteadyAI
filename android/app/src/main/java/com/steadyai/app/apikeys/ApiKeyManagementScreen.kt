package com.steadyai.app.apikeys

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

enum class FeedbackType {
    NONE,
    SUCCESS,
    ERROR
}

data class ApiKeyUiState(
    val selectedProvider: LlmProvider = LlmProvider.OPENAI,
    val apiKeyInput: String = "",
    val isInputVisible: Boolean = false,
    val maskedPreviews: Map<LlmProvider, String?> = emptyMap(),
    val feedback: String? = null,
    val feedbackType: FeedbackType = FeedbackType.NONE
)

@HiltViewModel
class ApiKeyManagementViewModel @Inject constructor(
    private val apiKeyStore: ApiKeyStore
) : ViewModel() {
    private val _uiState = MutableStateFlow(ApiKeyUiState())
    val uiState: StateFlow<ApiKeyUiState> = _uiState.asStateFlow()

    init {
        refreshStoredKeys()
    }

    fun selectProvider(provider: LlmProvider) {
        _uiState.update {
            it.copy(
                selectedProvider = provider,
                apiKeyInput = "",
                feedback = null,
                feedbackType = FeedbackType.NONE
            )
        }
    }

    fun updateApiKeyInput(value: String) {
        _uiState.update {
            it.copy(
                apiKeyInput = value,
                feedback = null,
                feedbackType = FeedbackType.NONE
            )
        }
    }

    fun toggleInputVisibility() {
        _uiState.update { it.copy(isInputVisible = !it.isInputVisible) }
    }

    fun saveKey() {
        val state = uiState.value
        val provider = state.selectedProvider
        val normalized = state.apiKeyInput.trim()

        val error = validate(provider, normalized)
        if (error != null) {
            _uiState.update { it.copy(feedback = error, feedbackType = FeedbackType.ERROR) }
            return
        }

        viewModelScope.launch(Dispatchers.IO) {
            apiKeyStore.save(provider, normalized)
            val preview = apiKeyStore.getMaskedPreview(provider)

            _uiState.update {
                it.copy(
                    apiKeyInput = "",
                    maskedPreviews = it.maskedPreviews + (provider to preview),
                    feedback = "Saved encrypted key for ${provider.label}.",
                    feedbackType = FeedbackType.SUCCESS
                )
            }
        }
    }

    fun clearKey() {
        val provider = uiState.value.selectedProvider
        viewModelScope.launch(Dispatchers.IO) {
            apiKeyStore.clear(provider)
            _uiState.update {
                it.copy(
                    apiKeyInput = "",
                    maskedPreviews = it.maskedPreviews + (provider to null),
                    feedback = "Removed stored key for ${provider.label}.",
                    feedbackType = FeedbackType.SUCCESS
                )
            }
        }
    }

    private fun refreshStoredKeys() {
        viewModelScope.launch(Dispatchers.IO) {
            val previews = apiKeyStore.getMaskedPreviews()
            _uiState.update { it.copy(maskedPreviews = previews) }
        }
    }

    private fun validate(provider: LlmProvider, key: String): String? {
        if (key.isBlank()) {
            return "API key is required."
        }

        return when (provider) {
            LlmProvider.OPENAI -> {
                if (key.startsWith("sk-") && key.length >= 20) null
                else "OpenAI keys usually start with 'sk-' and are longer."
            }

            LlmProvider.GEMINI -> {
                if (key.startsWith("AIza") && key.length >= 20) null
                else "Gemini keys usually start with 'AIza'."
            }

            LlmProvider.GROQ -> {
                if (key.startsWith("gsk_") && key.length >= 20) null
                else "Groq keys usually start with 'gsk_'."
            }
        }
    }
}

@Composable
fun ApiKeyManagementScreen(viewModel: ApiKeyManagementViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsState()

    Surface(modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text("API Key Management", style = MaterialTheme.typography.titleLarge)
            Text(
                "Store provider keys locally in encrypted storage on this device.",
                style = MaterialTheme.typography.bodyMedium
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                LlmProvider.entries.forEach { provider ->
                    FilterChip(
                        selected = provider == state.selectedProvider,
                        onClick = { viewModel.selectProvider(provider) },
                        label = { Text(provider.label) }
                    )
                }
            }

            val selectedPreview = state.maskedPreviews[state.selectedProvider]
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Text("Stored key", style = MaterialTheme.typography.labelLarge)
                    Text(
                        selectedPreview ?: "No key stored for ${state.selectedProvider.label}.",
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            }

            OutlinedTextField(
                value = state.apiKeyInput,
                onValueChange = viewModel::updateApiKeyInput,
                label = { Text("${state.selectedProvider.label} API key") },
                visualTransformation = if (state.isInputVisible) {
                    VisualTransformation.None
                } else {
                    PasswordVisualTransformation()
                },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(onClick = viewModel::toggleInputVisibility, modifier = Modifier.weight(1f)) {
                    Text(if (state.isInputVisible) "Hide" else "Show")
                }
                Button(onClick = viewModel::saveKey, modifier = Modifier.weight(1f)) {
                    Text("Save")
                }
                Button(onClick = viewModel::clearKey, modifier = Modifier.weight(1f)) {
                    Text("Clear")
                }
            }

            state.feedback?.let { message ->
                val color = when (state.feedbackType) {
                    FeedbackType.ERROR -> MaterialTheme.colorScheme.error
                    FeedbackType.SUCCESS -> MaterialTheme.colorScheme.primary
                    FeedbackType.NONE -> MaterialTheme.colorScheme.onSurface
                }
                Text(
                    text = message,
                    color = color,
                    style = MaterialTheme.typography.bodySmall
                )
            }
        }
    }
}
