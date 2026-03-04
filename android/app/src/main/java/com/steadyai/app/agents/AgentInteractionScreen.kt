package com.steadyai.app.agents

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
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
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.steadyai.core.model.assistant.AssistantMessageRequest
import com.steadyai.core.model.assistant.AssistantMessageResponse
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

private const val ASSISTANT_DISCLAIMER =
    "Steady AI guidance is educational and supportive, not medical advice. For medical concerns, consult a licensed clinician."

private val STARTER_PROMPTS = listOf(
    "I missed check-ins this week. Give me a simple reset plan.",
    "Plan a simple 3-day high-protein meal plan with quick dinners.",
    "Suggest one low-pressure community post I can share today.",
    "Explain the myth: carbs at night always cause fat gain."
)

@HiltViewModel
class AgentInteractionViewModel @Inject constructor(
    private val apiService: ApiService,
    private val apiClient: ApiClient
) : ViewModel() {
    private val _uiState = MutableStateFlow(
        AgentUiState(
            messages = listOf(
                AgentMessage(
                    role = MessageRole.SYSTEM,
                    text = "Assistant Hub is ready. Ask one question and I will route it to the right tool.",
                    disclaimer = ASSISTANT_DISCLAIMER
                )
            )
        )
    )
    val uiState: StateFlow<AgentUiState> = _uiState.asStateFlow()

    fun updateInput(value: String) {
        _uiState.update { it.copy(input = value, error = null) }
    }

    fun sendMessage() {
        sendPrompt(uiState.value.input)
    }

    fun sendStarterPrompt(prompt: String) {
        sendPrompt(prompt)
    }

    private fun sendPrompt(promptText: String) {
        if (_uiState.value.isSending) return
        val prompt = promptText.trim()
        if (prompt.isEmpty()) {
            _uiState.update { it.copy(error = "Type a message before sending.") }
            return
        }

        val userMessage = AgentMessage(role = MessageRole.USER, text = prompt)
        _uiState.update {
            it.copy(
                input = "",
                isSending = true,
                error = null,
                messages = it.messages + userMessage
            )
        }

        viewModelScope.launch {
            when (val result = apiClient.execute { apiService.sendAssistantMessage(AssistantMessageRequest(message = prompt)) }) {
                is ApiResult.Success -> {
                    val assistantMessage = result.data.toUiMessage()
                    _uiState.update {
                        it.copy(
                            isSending = false,
                            messages = it.messages + assistantMessage
                        )
                    }
                }

                is ApiResult.Failure -> {
                    _uiState.update {
                        it.copy(
                            isSending = false,
                            error = result.error.message,
                            messages = it.messages + AgentMessage(
                                role = MessageRole.AGENT,
                                text = "Assistant is unavailable right now. Please retry.",
                                disclaimer = ASSISTANT_DISCLAIMER
                            )
                        )
                    }
                }
            }
        }
    }
}

private fun AssistantMessageResponse.toUiMessage(): AgentMessage {
    val reasoningCard = cards.firstOrNull { it.type == "reasoning" }
    val reasoning = reasoningCard?.items?.map { item ->
        val parts = item.split(":")
        if (parts.size < 2) AgentReasoning("Note", item)
        else AgentReasoning(parts.first().trim(), parts.drop(1).joinToString(":").trim())
    }.orEmpty()

    val uiCards = cards.map { card ->
        AssistantUiCard(
            id = card.id,
            type = card.type,
            title = card.title,
            body = card.body,
            items = card.items,
            actions = card.actions.map { action ->
                AssistantUiAction(
                    label = action.label,
                    prompt = action.prompt
                )
            }
        )
    }

    return AgentMessage(
        role = MessageRole.AGENT,
        text = reply,
        reasoning = reasoning,
        cards = uiCards,
        disclaimer = disclaimer ?: ASSISTANT_DISCLAIMER
    )
}

@Composable
fun AgentInteractionScreen(viewModel: AgentInteractionViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsState()

    Surface(modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Text("Assistant Hub", style = MaterialTheme.typography.titleLarge)

            Card(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = ASSISTANT_DISCLAIMER,
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier.padding(12.dp)
                )
            }

            StarterPrompts(
                prompts = STARTER_PROMPTS,
                onPromptClick = viewModel::sendStarterPrompt
            )

            ChatMessages(
                messages = state.messages,
                modifier = Modifier.weight(1f),
                onActionClick = viewModel::sendStarterPrompt
            )

            state.error?.let {
                Text(
                    text = it,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.error
                )
            }

            ChatInput(
                input = state.input,
                isSending = state.isSending,
                onInputChanged = viewModel::updateInput,
                onSend = viewModel::sendMessage
            )
        }
    }
}

@Composable
private fun StarterPrompts(
    prompts: List<String>,
    onPromptClick: (String) -> Unit
) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text("Try one:", style = MaterialTheme.typography.labelLarge)
        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            items(prompts, key = { it }) { prompt ->
                FilterChip(
                    selected = false,
                    onClick = { onPromptClick(prompt) },
                    label = { Text(prompt) }
                )
            }
        }
    }
}

@Composable
private fun ChatMessages(
    messages: List<AgentMessage>,
    modifier: Modifier = Modifier,
    onActionClick: (String) -> Unit
) {
    if (messages.isEmpty()) {
        Box(modifier = modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
            Text("Start by asking for support.")
        }
        return
    }

    LazyColumn(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(messages, key = { it.id }) { message ->
            MessageBubble(message, onActionClick)
        }
    }
}

@Composable
private fun MessageBubble(
    message: AgentMessage,
    onActionClick: (String) -> Unit
) {
    val alignEnd = message.role == MessageRole.USER

    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (alignEnd) Arrangement.End else Arrangement.Start
    ) {
        Card(
            modifier = Modifier.fillMaxWidth(if (alignEnd) 0.82f else 0.92f)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(10.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Text(
                    text = message.text,
                    style = MaterialTheme.typography.bodyMedium,
                    textAlign = if (alignEnd) TextAlign.End else TextAlign.Start,
                    modifier = Modifier.fillMaxWidth()
                )

                if (message.reasoning.isNotEmpty()) {
                    Card(modifier = Modifier.fillMaxWidth()) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(8.dp),
                            verticalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Text("Reasoning", style = MaterialTheme.typography.labelMedium)
                            message.reasoning.forEach { step ->
                                Text(
                                    text = "• ${step.title}: ${step.detail}",
                                    style = MaterialTheme.typography.bodySmall
                                )
                            }
                        }
                    }
                }

                if (message.cards.isNotEmpty()) {
                    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        message.cards.forEach { card ->
                            Card(modifier = Modifier.fillMaxWidth()) {
                                Column(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(8.dp),
                                    verticalArrangement = Arrangement.spacedBy(4.dp)
                                ) {
                                    Text(card.title, style = MaterialTheme.typography.labelMedium)
                                    card.body?.let { Text(it, style = MaterialTheme.typography.bodySmall) }
                                    card.items.forEach { item ->
                                        Text("• $item", style = MaterialTheme.typography.bodySmall)
                                    }
                                    if (card.actions.isNotEmpty()) {
                                        LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                            itemsIndexed(card.actions, key = { _, item -> "${card.id}:${item.label}" }) { _, action ->
                                                FilterChip(
                                                    selected = false,
                                                    onClick = { onActionClick(action.prompt) },
                                                    label = { Text(action.label) }
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                message.disclaimer?.let {
                    Text(
                        text = it,
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}

@Composable
private fun ChatInput(
    input: String,
    isSending: Boolean,
    onInputChanged: (String) -> Unit,
    onSend: () -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.Bottom
    ) {
        OutlinedTextField(
            value = input,
            onValueChange = onInputChanged,
            label = { Text("Message") },
            modifier = Modifier.weight(1f),
            maxLines = 4
        )

        Button(
            onClick = onSend,
            enabled = !isSending
        ) {
            Text(if (isSending) "..." else "Send")
        }
    }
}
