package com.steadyai.app.apikeys

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun ApiKeyManagementScreen() {
    Surface(modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text("AI Provider Settings", style = MaterialTheme.typography.titleLarge)
            Text(
                "Personal provider key entry is disabled. SteadyAI uses server-managed provider credentials.",
                style = MaterialTheme.typography.bodyMedium
            )

            Card(modifier = Modifier.fillMaxWidth()) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Text("Removed", style = MaterialTheme.typography.labelLarge)
                    Text(
                        "Google Gemini and Groq user API key input has been removed from Android.",
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Text(
                        "To change providers or keys, update backend environment variables.",
                        style = MaterialTheme.typography.bodySmall
                    )
                }
            }
        }
    }
}

