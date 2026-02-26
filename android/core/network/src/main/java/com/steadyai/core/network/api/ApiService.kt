package com.steadyai.core.network.api

import com.steadyai.core.model.ApiStatus
import com.steadyai.core.model.challenge.ChallengeCheckInRequest
import com.steadyai.core.model.challenge.ChallengeCheckInResponse
import com.steadyai.core.model.community.CommunityFeedResponse
import com.steadyai.core.model.community.CommunityPost
import com.steadyai.core.model.community.CommunityReaction
import com.steadyai.core.model.community.CreateCommunityPostRequest
import com.steadyai.core.model.community.UpsertCommunityReactionRequest
import com.steadyai.core.model.onboarding.OnboardingRequest
import com.steadyai.core.model.onboarding.OnboardingResponse
import com.steadyai.core.model.store.StoreProductsResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface ApiService {
    @GET("api/health")
    suspend fun healthCheck(): Response<ApiStatus>

    @POST("api/onboarding")
    suspend fun submitOnboarding(
        @Body request: OnboardingRequest
    ): Response<OnboardingResponse>

    @GET("api/community/feed")
    suspend fun getCommunityFeed(
        @Query("limit") limit: Int = 20,
        @Query("cursorCreatedAt") cursorCreatedAt: String? = null,
        @Query("cursorId") cursorId: String? = null
    ): Response<CommunityFeedResponse>

    @POST("api/community/posts")
    suspend fun createCommunityPost(
        @Body request: CreateCommunityPostRequest
    ): Response<CommunityPost>

    @POST("api/community/posts/{postId}/reactions")
    suspend fun upsertReaction(
        @Path("postId") postId: String,
        @Body request: UpsertCommunityReactionRequest
    ): Response<CommunityReaction>

    @DELETE("api/community/posts/{postId}/reactions")
    suspend fun deleteReaction(
        @Path("postId") postId: String
    ): Response<Unit>

    @POST("api/challenges/check-in")
    suspend fun submitCheckIn(
        @Body request: ChallengeCheckInRequest
    ): Response<ChallengeCheckInResponse>

    @GET("api/store/products")
    suspend fun getStoreProducts(): Response<StoreProductsResponse>
}
