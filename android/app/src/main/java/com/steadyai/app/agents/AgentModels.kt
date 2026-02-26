package com.steadyai.app.agents

import java.util.UUID

enum class AgentType(val label: String) {
    MEAL_PLANNER("Meal Planner"),
    HABIT_COACH("Habit Coach"),
    COMMUNITY_GUIDE("Community Guide")
}

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
    val disclaimer: String? = null
)

data class AgentUiState(
    val selectedAgent: AgentType = AgentType.MEAL_PLANNER,
    val messagesByAgent: Map<AgentType, List<AgentMessage>> = emptyMap(),
    val input: String = "",
    val isSending: Boolean = false,
    val error: String? = null
) {
    val currentMessages: List<AgentMessage>
        get() = messagesByAgent[selectedAgent].orEmpty()
}
