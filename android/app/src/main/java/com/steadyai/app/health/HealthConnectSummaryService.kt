package com.steadyai.app.health

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
    suspend fun fetchAggregatedMetrics(
        windowStart: Instant,
        windowEnd: Instant
    ): Result<AggregatedHealthSummary>

    suspend fun storeAggregatedSummary(summary: AggregatedHealthSummary): Result<Unit>
}

