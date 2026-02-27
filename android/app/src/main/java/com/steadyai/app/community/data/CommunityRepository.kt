package com.steadyai.app.community.data

import com.steadyai.core.model.community.CommunityPost
import com.steadyai.core.model.community.CommunityPostType
import com.steadyai.core.model.community.CommunityReaction
import com.steadyai.core.model.community.CommunityReactionType
import com.steadyai.core.model.community.CreateCommunityPostRequest
import com.steadyai.core.model.community.UpsertCommunityReactionRequest
import com.steadyai.core.network.api.ApiService
import com.steadyai.core.network.client.ApiClient
import com.steadyai.core.network.model.ApiResult
import javax.inject.Inject
import javax.inject.Singleton

data class CommunityFeedPage(
    val groupId: String?,
    val activeChallengeId: String?,
    val posts: List<CommunityPost>,
    val nextCursorCreatedAt: String?,
    val nextCursorId: String?
)

@Singleton
class CommunityRepository @Inject constructor(
    private val apiService: ApiService,
    private val apiClient: ApiClient
) {
    suspend fun getFeedPage(
        limit: Int = 20,
        cursorCreatedAt: String? = null,
        cursorId: String? = null
    ): ApiResult<CommunityFeedPage> {
        return when (
            val result = apiClient.execute {
                apiService.getCommunityFeed(
                    limit = limit,
                    cursorCreatedAt = cursorCreatedAt,
                    cursorId = cursorId
                )
            }
        ) {
            is ApiResult.Success -> ApiResult.Success(
                data = CommunityFeedPage(
                    groupId = result.data.groupId,
                    activeChallengeId = result.data.activeChallengeId,
                    posts = result.data.items,
                    nextCursorCreatedAt = result.data.nextCursor?.createdAt,
                    nextCursorId = result.data.nextCursor?.id
                ),
                httpCode = result.httpCode
            )

            is ApiResult.Failure -> result
        }
    }

    suspend fun createPost(
        type: CommunityPostType,
        content: String
    ): ApiResult<CommunityPost> {
        return apiClient.execute {
            apiService.createCommunityPost(
                CreateCommunityPostRequest(
                    type = type,
                    content = content.trim()
                )
            )
        }
    }

    suspend fun upsertReaction(
        postId: String,
        type: CommunityReactionType
    ): ApiResult<CommunityReaction> {
        return apiClient.execute {
            apiService.upsertReaction(
                postId = postId,
                request = UpsertCommunityReactionRequest(type = type)
            )
        }
    }

    suspend fun deleteReaction(postId: String): ApiResult<Unit> {
        return apiClient.execute {
            apiService.deleteReaction(postId = postId)
        }
    }
}
