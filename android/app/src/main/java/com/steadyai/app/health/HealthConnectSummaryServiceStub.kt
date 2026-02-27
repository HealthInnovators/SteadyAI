package com.steadyai.app.health

import android.content.Context
import androidx.health.connect.client.HealthConnectClient
import dagger.hilt.android.qualifiers.ApplicationContext
import java.time.Instant
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

@Singleton
class HealthConnectSummaryServiceStub @Inject constructor(
    @ApplicationContext private val context: Context
) : HealthConnectSummaryService {

    private val appContext = context.applicationContext
    private val healthConnectClient by lazy { HealthConnectClient.getOrCreate(appContext) }

    override suspend fun fetchAggregatedMetrics(
        windowStart: Instant,
        windowEnd: Instant
    ): Result<AggregatedHealthSummary> = withContext(Dispatchers.IO) {
        runCatching {
            val sdkStatus = HealthConnectClient.getSdkStatus(appContext)
            if (sdkStatus != HealthConnectClient.SDK_AVAILABLE) {
                throw IllegalStateException("Health Connect is not available on this device.")
            }

            // Stub behavior:
            // 1) Validate availability and initialize client.
            // 2) Return aggregated-only payload.
            // TODO: Replace placeholder values with aggregate() calls once permissions are wired.
            @Suppress("UNUSED_VARIABLE")
            val initializedClient = healthConnectClient

            AggregatedHealthSummary(
                windowStart = windowStart,
                windowEnd = windowEnd,
                generatedAt = Instant.now(),
                totalSteps = 0L,
                activeMinutes = 0L,
                sleepMinutes = 0L,
                totalCaloriesKcal = null,
                source = "health-connect-stub"
            )
        }
    }

    override suspend fun storeAggregatedSummary(summary: AggregatedHealthSummary): Result<Unit> =
        withContext(Dispatchers.IO) {
            runCatching {
                // Persist aggregate snapshot only. No raw health records are written.
                val preferences = appContext.getSharedPreferences(
                    "health_connect_aggregates",
                    Context.MODE_PRIVATE
                )

                preferences.edit()
                    .putString("window_start", summary.windowStart.toString())
                    .putString("window_end", summary.windowEnd.toString())
                    .putString("generated_at", summary.generatedAt.toString())
                    .putLong("total_steps", summary.totalSteps)
                    .putLong("active_minutes", summary.activeMinutes)
                    .putLong("sleep_minutes", summary.sleepMinutes)
                    .putString("total_calories_kcal", summary.totalCaloriesKcal?.toString())
                    .putString("source", summary.source)
                    .apply()
            }
        }
}

