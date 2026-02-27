package com.steadyai.app.agents

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

private const val AGENT_DISCLAIMER =
    "Steady AI guidance is educational and supportive, not medical advice. For medical concerns, consult a licensed clinician."

@HiltViewModel
class AgentInteractionViewModel @Inject constructor() : ViewModel() {
    private val _uiState = MutableStateFlow(
        AgentUiState(
            messagesByAgent = AgentType.entries.associateWith { listOf(welcomeMessageFor(it)) }
        )
    )
    val uiState: StateFlow<AgentUiState> = _uiState.asStateFlow()

    fun selectAgent(agentType: AgentType) {
        _uiState.update { it.copy(selectedAgent = agentType, error = null) }
    }

    fun updateInput(value: String) {
        _uiState.update { it.copy(input = value, error = null) }
    }

    fun sendMessage() {
        val state = uiState.value
        if (state.isSending) {
            return
        }

        val prompt = state.input.trim()
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
                messagesByAgent = appendMessage(
                    messagesByAgent = it.messagesByAgent,
                    agentType = it.selectedAgent,
                    message = userMessage
                )
            )
        }

        viewModelScope.launch {
            delay(250)
            val response = agentResponseFor(state.selectedAgent, prompt)
            _uiState.update {
                it.copy(
                    isSending = false,
                    messagesByAgent = appendMessage(
                        messagesByAgent = it.messagesByAgent,
                        agentType = it.selectedAgent,
                        message = response
                    )
                )
            }
        }
    }

    private fun appendMessage(
        messagesByAgent: Map<AgentType, List<AgentMessage>>,
        agentType: AgentType,
        message: AgentMessage
    ): Map<AgentType, List<AgentMessage>> {
        val updated = messagesByAgent.toMutableMap()
        updated[agentType] = updated[agentType].orEmpty() + message
        return updated
    }

    private fun welcomeMessageFor(agentType: AgentType): AgentMessage {
        val text = when (agentType) {
            AgentType.MEAL_PLANNER -> "Tell me your constraints and I can draft a simple 3-day meal plan with a grocery list."
            AgentType.HABIT_COACH -> "Share how your week felt and I can help with a supportive reflection and one focused habit adjustment."
            AgentType.COMMUNITY_GUIDE -> "Describe your current momentum and I can suggest low-pressure community posts and peers to engage with."
        }

        return AgentMessage(
            role = MessageRole.SYSTEM,
            text = text,
            disclaimer = AGENT_DISCLAIMER
        )
    }

    private fun agentResponseFor(agentType: AgentType, prompt: String): AgentMessage {
        val summary = prompt.take(180)
        return when (agentType) {
            AgentType.MEAL_PLANNER -> AgentMessage(
                role = MessageRole.AGENT,
                text = "Plan draft ready: 3 balanced days centered on your request, with repeatable meals to reduce prep load.",
                reasoning = listOf(
                    AgentReasoning("Input parsed", "Used your latest request: \"$summary\"."),
                    AgentReasoning("Plan structure", "Kept breakfast/lunch simple and varied dinner to improve consistency."),
                    AgentReasoning("Safety", "Output avoids medical claims and stays educational.")
                ),
                disclaimer = AGENT_DISCLAIMER
            )

            AgentType.HABIT_COACH -> AgentMessage(
                role = MessageRole.AGENT,
                text = "Reflection ready: you are building consistency, and the next step is one small habit shift you can sustain this week.",
                reasoning = listOf(
                    AgentReasoning("Tone", "Framed feedback as supportive and non-judgmental."),
                    AgentReasoning("Scope", "Limited to one adjustment to keep effort realistic."),
                    AgentReasoning("Safety", "No diagnosis or medical recommendation included.")
                ),
                disclaimer = AGENT_DISCLAIMER
            )

            AgentType.COMMUNITY_GUIDE -> AgentMessage(
                role = MessageRole.AGENT,
                text = "Engagement plan ready: I suggest one progress post, one check-in question, and two peer outreach prompts.",
                reasoning = listOf(
                    AgentReasoning("Engagement strategy", "Prioritized low-pressure prompts that encourage participation."),
                    AgentReasoning("Bias control", "Avoided ranking or popularity-based suggestions."),
                    AgentReasoning("Safety", "Kept guidance informational and non-medical.")
                ),
                disclaimer = AGENT_DISCLAIMER
            )
        }
    }
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
            Text("Agent Workspace", style = MaterialTheme.typography.titleLarge)

            Card(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = AGENT_DISCLAIMER,
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier.padding(12.dp)
                )
            }

            AgentSelector(
                selected = state.selectedAgent,
                onSelect = viewModel::selectAgent
            )

            ChatMessages(
                messages = state.currentMessages,
                modifier = Modifier.weight(1f)
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
private fun AgentSelector(
    selected: AgentType,
    onSelect: (AgentType) -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        AgentType.entries.forEach { type ->
            FilterChip(
                selected = selected == type,
                onClick = { onSelect(type) },
                label = { Text(type.label) }
            )
        }
    }
}

@Composable
private fun ChatMessages(
    messages: List<AgentMessage>,
    modifier: Modifier = Modifier
) {
    if (messages.isEmpty()) {
        Box(modifier = modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
            Text("Start by asking an agent for support.")
        }
        return
    }

    LazyColumn(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(messages, key = { it.id }) { message ->
            MessageBubble(message)
        }
    }
}

@Composable
private fun MessageBubble(message: AgentMessage) {
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
