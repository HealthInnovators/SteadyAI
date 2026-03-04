package com.steadyai.app.health

import android.content.Context
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.records.ExerciseSessionRecord
import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import dagger.hilt.android.qualifiers.ApplicationContext
import java.time.Instant
import java.time.temporal.ChronoUnit
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

    override fun requiredReadPermissions(): Set<String> = defaultHealthConnectReadPermissions()

    override suspend fun hasRequiredPermissions(): Result<Boolean> = withContext(Dispatchers.IO) {
        runCatching {
            val granted = healthConnectClient.permissionController.getGrantedPermissions()
            granted.containsAll(requiredReadPermissions())
        }
    }

    override suspend fun fetchAggregatedMetrics(
        windowStart: Instant,
        windowEnd: Instant
    ): Result<AggregatedHealthSummary> = withContext(Dispatchers.IO) {
        runCatching {
            val sdkStatus = HealthConnectClient.getSdkStatus(appContext)
            if (sdkStatus != HealthConnectClient.SDK_AVAILABLE) {
                throw IllegalStateException("Health Connect is not available on this device.")
            }

            val granted = healthConnectClient.permissionController.getGrantedPermissions()
            if (!granted.containsAll(requiredReadPermissions())) {
                throw IllegalStateException("Health Connect permissions are not granted.")
            }

            val totalSteps = readAllSteps(windowStart = windowStart, windowEnd = windowEnd)
            val activeMinutes = readAllActiveMinutes(windowStart = windowStart, windowEnd = windowEnd)
            val sleepMinutes = readAllSleepMinutes(windowStart = windowStart, windowEnd = windowEnd)

            AggregatedHealthSummary(
                windowStart = windowStart,
                windowEnd = windowEnd,
                generatedAt = Instant.now(),
                totalSteps = totalSteps,
                activeMinutes = activeMinutes,
                sleepMinutes = sleepMinutes,
                totalCaloriesKcal = null,
                source = "health-connect"
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

    private suspend fun readAllSteps(windowStart: Instant, windowEnd: Instant): Long {
        var pageToken: String? = null
        var total = 0L

        do {
            val response = healthConnectClient.readRecords(
                ReadRecordsRequest(
                    recordType = StepsRecord::class,
                    timeRangeFilter = TimeRangeFilter.between(windowStart, windowEnd),
                    pageToken = pageToken
                )
            )

            total += response.records.sumOf { it.count }
            pageToken = response.pageToken
        } while (pageToken != null)

        return total
    }

    private suspend fun readAllActiveMinutes(windowStart: Instant, windowEnd: Instant): Long {
        var pageToken: String? = null
        var totalMinutes = 0L

        do {
            val response = healthConnectClient.readRecords(
                ReadRecordsRequest(
                    recordType = ExerciseSessionRecord::class,
                    timeRangeFilter = TimeRangeFilter.between(windowStart, windowEnd),
                    pageToken = pageToken
                )
            )

            totalMinutes += response.records.sumOf { session ->
                ChronoUnit.MINUTES.between(session.startTime, session.endTime).coerceAtLeast(0)
            }
            pageToken = response.pageToken
        } while (pageToken != null)

        return totalMinutes
    }

    private suspend fun readAllSleepMinutes(windowStart: Instant, windowEnd: Instant): Long {
        var pageToken: String? = null
        var totalMinutes = 0L

        do {
            val response = healthConnectClient.readRecords(
                ReadRecordsRequest(
                    recordType = SleepSessionRecord::class,
                    timeRangeFilter = TimeRangeFilter.between(windowStart, windowEnd),
                    pageToken = pageToken
                )
            )

            totalMinutes += response.records.sumOf { session ->
                ChronoUnit.MINUTES.between(session.startTime, session.endTime).coerceAtLeast(0)
            }
            pageToken = response.pageToken
        } while (pageToken != null)

        return totalMinutes
    }
}
