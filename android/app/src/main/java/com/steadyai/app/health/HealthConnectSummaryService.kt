package com.steadyai.app.health

import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.ExerciseSessionRecord
import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.records.StepsRecord
import java.time.Instant

/**
 * Aggregated-only summary payload for Health Connect sync.
 * No raw record data is exposed or persisted.
 */
data class AggregatedHealthSummary(
    val windowStart: Instant,
    val windowEnd: Instant,
    val generatedAt: Instant,
    val totalSteps: Long,
    val activeMinutes: Long,
    val sleepMinutes: Long,
    val totalCaloriesKcal: Double?,
    val source: String
)

interface HealthConnectSummaryService {
    fun requiredReadPermissions(): Set<String>

    suspend fun hasRequiredPermissions(): Result<Boolean>

    suspend fun fetchAggregatedMetrics(
        windowStart: Instant,
        windowEnd: Instant
    ): Result<AggregatedHealthSummary>

    suspend fun storeAggregatedSummary(summary: AggregatedHealthSummary): Result<Unit>
}

fun defaultHealthConnectReadPermissions(): Set<String> {
    return setOf(
        HealthPermission.getReadPermission(StepsRecord::class),
        HealthPermission.getReadPermission(ExerciseSessionRecord::class),
        HealthPermission.getReadPermission(SleepSessionRecord::class)
    )
}
