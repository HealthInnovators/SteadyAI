package com.steadyai.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.steadyai.app.health.HealthConnectSyncScheduler
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        HealthConnectSyncScheduler.scheduleDailySync(applicationContext)
        setContent {
            SteadyNavHost()
        }
    }
}
