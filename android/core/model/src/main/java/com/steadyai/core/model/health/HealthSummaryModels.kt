package com.steadyai.core.model.health

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class HealthConnectSummaryRequest(
    @SerialName("userId")
    val userId: String,
    @SerialName("date")
    val date: String,
    @SerialName("steps")
    val steps: Long,
    @SerialName("activityMinutes")
    val activityMinutes: Long,
    @SerialName("sourceApp")
    val sourceApp: String? = null,
    @SerialName("deviceInstallId")
    val deviceInstallId: String? = null
)

@Serializable
data class HealthConnectSummaryResponse(
    @SerialName("connectionId")
    val connectionId: String,
    @SerialName("syncBatchId")
    val syncBatchId: String,
    @SerialName("date")
    val date: String,
    @SerialName("recordsUpserted")
    val recordsUpserted: Int,
    @SerialName("summary")
    val summary: HealthConnectSummaryStats
)

@Serializable
data class HealthConnectSummaryStats(
    @SerialName("steps")
    val steps: Long,
    @SerialName("activityMinutes")
    val activityMinutes: Long
)
