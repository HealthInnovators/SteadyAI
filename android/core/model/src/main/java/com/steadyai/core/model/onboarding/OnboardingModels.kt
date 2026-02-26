package com.steadyai.core.model.onboarding

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class OnboardingRequest(
    @SerialName("primaryGoal")
    val primaryGoal: String,
    @SerialName("experienceLevel")
    val experienceLevel: String,
    @SerialName("dietaryPreferences")
    val dietaryPreferences: List<String>,
    @SerialName("timeAvailability")
    val timeAvailability: String
)

@Serializable
data class OnboardingResponse(
    @SerialName("id")
    val id: String,
    @SerialName("email")
    val email: String? = null,
    @SerialName("username")
    val username: String? = null,
    @SerialName("primaryGoal")
    val primaryGoal: String? = null,
    @SerialName("experienceLevel")
    val experienceLevel: String? = null,
    @SerialName("dietaryPreferences")
    val dietaryPreferences: List<String> = emptyList(),
    @SerialName("timeAvailability")
    val timeAvailability: String? = null,
    @SerialName("onboardingCompleted")
    val onboardingCompleted: Boolean = false,
    @SerialName("assignedCommunityGroupId")
    val assignedCommunityGroupId: String? = null,
    @SerialName("assignedChallengeId")
    val assignedChallengeId: String? = null
)
