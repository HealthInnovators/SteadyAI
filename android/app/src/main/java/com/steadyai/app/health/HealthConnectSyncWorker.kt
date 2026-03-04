package com.steadyai.app.health

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.steadyai.app.session.SessionManager
import com.steadyai.core.model.health.HealthConnectSummaryRequest
import com.steadyai.core.network.api.ApiService
import com.steadyai.core.network.client.ApiClient
import com.steadyai.core.network.model.ApiResult
import dagger.hilt.EntryPoint
import dagger.hilt.InstallIn
import dagger.hilt.android.EntryPointAccessors
import dagger.hilt.components.SingletonComponent
import java.time.Instant
import java.time.ZoneOffset

class HealthConnectSyncWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    @EntryPoint
    @InstallIn(SingletonComponent::class)
    interface WorkerEntryPoint {
        fun healthService(): HealthConnectSummaryService
        fun apiService(): ApiService
        fun apiClient(): ApiClient
        fun sessionManager(): SessionManager
    }

    override suspend fun doWork(): Result {
        val entryPoint = EntryPointAccessors.fromApplication(applicationContext, WorkerEntryPoint::class.java)
        val sessionManager = entryPoint.sessionManager()
        val userId = sessionManager.getCurrentUserIdOrNull() ?: return Result.success()

        val hasPermissions = entryPoint.healthService().hasRequiredPermissions().getOrNull() == true
        if (!hasPermissions) {
            return Result.success()
        }

        val windowEnd = Instant.now()
        val windowStart = windowEnd.minusSeconds(24 * 60 * 60)

        val summary = entryPoint.healthService().fetchAggregatedMetrics(windowStart, windowEnd).getOrElse {
            return Result.retry()
        }

        entryPoint.healthService().storeAggregatedSummary(summary)

        val request = HealthConnectSummaryRequest(
            userId = userId,
            date = summary.windowEnd.atOffset(ZoneOffset.UTC).toLocalDate().toString(),
            steps = summary.totalSteps,
            activityMinutes = summary.activeMinutes,
            sourceApp = summary.source
        )

        return when (entryPoint.apiClient().execute { entryPoint.apiService().submitHealthConnectSummary(request) }) {
            is ApiResult.Success -> Result.success()
            is ApiResult.Failure -> Result.retry()
        }
    }
}
