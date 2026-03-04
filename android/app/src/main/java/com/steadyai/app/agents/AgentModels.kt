package com.steadyai.app.agents

import java.util.UUID

enum class MessageRole {
    USER,
    AGENT,
    SYSTEM
}

data class AgentReasoning(
    val title: String,
    val detail: String
)

data class AgentMessage(
    val id: String = UUID.randomUUID().toString(),
    val role: MessageRole,
    val text: String,
    val reasoning: List<AgentReasoning> = emptyList(),
    val cards: List<AssistantUiCard> = emptyList(),
    val disclaimer: String? = null
)

data class AssistantUiCard(
    val id: String,
    val type: String,
    val title: String,
    val body: String?,
    val items: List<String>,
    val actions: List<AssistantUiAction> = emptyList()
)

data class AssistantUiAction(
    val label: String,
    val prompt: String
)

data class AgentUiState(
    val messages: List<AgentMessage> = emptyList(),
    val input: String = "",
    val isSending: Boolean = false,
    val error: String? = null
)
