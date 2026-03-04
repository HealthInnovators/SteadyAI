package com.steadyai.app.health

import android.content.Context
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import java.util.concurrent.TimeUnit

object HealthConnectSyncScheduler {
    private const val UNIQUE_WORK_NAME = "health_connect_daily_sync"

    fun scheduleDailySync(context: Context) {
        val workRequest = PeriodicWorkRequestBuilder<HealthConnectSyncWorker>(24, TimeUnit.HOURS, 2, TimeUnit.HOURS)
            .setConstraints(
                Constraints.Builder()
                    .setRequiredNetworkType(NetworkType.CONNECTED)
                    .build()
            )
            .build()

        WorkManager.getInstance(context).enqueueUniquePeriodicWork(
            UNIQUE_WORK_NAME,
            ExistingPeriodicWorkPolicy.UPDATE,
            workRequest
        )
    }
}
