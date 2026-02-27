package com.steadyai.core.model.challenge

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class ChallengeCheckInRequest(
    @SerialName("status")
    val status: String
)

@Serializable
data class ChallengeCheckInResponse(
    @SerialName("participationId")
    val participationId: String,
    @SerialName("challengeId")
    val challengeId: String,
    @SerialName("participationStatus")
    val participationStatus: String,
    @SerialName("latestCheckIn")
    val latestCheckIn: LatestCheckIn? = null,
    @SerialName("counts")
    val counts: CheckInCounts
)

@Serializable
data class LatestCheckIn(
    @SerialName("date")
    val date: String,
    @SerialName("status")
    val status: String
)

@Serializable
data class CheckInCounts(
    @SerialName("total")
    val total: Int,
    @SerialName("completed")
    val completed: Int,
    @SerialName("partial")
    val partial: Int,
    @SerialName("skipped")
    val skipped: Int
)
