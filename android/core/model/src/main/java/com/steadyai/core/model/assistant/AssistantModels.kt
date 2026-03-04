package com.steadyai.core.model.assistant

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class AssistantMessageRequest(
    @SerialName("message")
    val message: String
)

@Serializable
data class AssistantCard(
    @SerialName("id")
    val id: String,
    @SerialName("type")
    val type: String,
    @SerialName("title")
    val title: String,
    @SerialName("body")
    val body: String? = null,
    @SerialName("items")
    val items: List<String> = emptyList(),
    @SerialName("actions")
    val actions: List<AssistantAction> = emptyList()
)

@Serializable
data class AssistantAction(
    @SerialName("label")
    val label: String,
    @SerialName("prompt")
    val prompt: String
)

@Serializable
data class AssistantMessageResponse(
    @SerialName("reply")
    val reply: String,
    @SerialName("disclaimer")
    val disclaimer: String? = null,
    @SerialName("routedTo")
    val routedTo: String? = null,
    @SerialName("toolInvocations")
    val toolInvocations: List<String> = emptyList(),
    @SerialName("cards")
    val cards: List<AssistantCard> = emptyList()
)
