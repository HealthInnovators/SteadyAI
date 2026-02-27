package com.steadyai.core.model.community

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
enum class CommunityPostType {
    WIN,
    QUESTION,
    CHECK_IN
}

@Serializable
enum class CommunityReactionType {
    LIKE,
    CELEBRATE,
    SUPPORT
}

@Serializable
data class CreateCommunityPostRequest(
    @SerialName("type")
    val type: CommunityPostType,
    @SerialName("content")
    val content: String
)

@Serializable
data class UpsertCommunityReactionRequest(
    @SerialName("type")
    val type: CommunityReactionType
)

@Serializable
data class CommunityFeedResponse(
    @SerialName("groupId")
    val groupId: String? = null,
    @SerialName("activeChallengeId")
    val activeChallengeId: String? = null,
    @SerialName("items")
    val items: List<CommunityPost> = emptyList(),
    @SerialName("nextCursor")
    val nextCursor: CommunityFeedCursor? = null
)

@Serializable
data class CommunityFeedCursor(
    @SerialName("createdAt")
    val createdAt: String,
    @SerialName("id")
    val id: String
)

@Serializable
data class CommunityPost(
    @SerialName("id")
    val id: String,
    @SerialName("type")
    val type: String? = null,
    @SerialName("content")
    val content: String,
    @SerialName("createdAt")
    val createdAt: String,
    @SerialName("author")
    val author: CommunityAuthor,
    @SerialName("group")
    val group: CommunityGroup? = null,
    @SerialName("challenge")
    val challenge: CommunityChallenge? = null,
    @SerialName("reactions")
    val reactions: List<CommunityReaction> = emptyList()
)

@Serializable
data class CommunityAuthor(
    @SerialName("id")
    val id: String,
    @SerialName("username")
    val username: String,
    @SerialName("displayName")
    val displayName: String? = null
)

@Serializable
data class CommunityGroup(
    @SerialName("id")
    val id: String,
    @SerialName("name")
    val name: String
)

@Serializable
data class CommunityChallenge(
    @SerialName("id")
    val id: String,
    @SerialName("title")
    val title: String
)

@Serializable
data class CommunityReaction(
    @SerialName("id")
    val id: String,
    @SerialName("type")
    val type: String,
    @SerialName("userId")
    val userId: String,
    @SerialName("createdAt")
    val createdAt: String
)
