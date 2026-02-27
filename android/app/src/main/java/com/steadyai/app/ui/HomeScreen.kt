package com.steadyai.app.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.steadyai.app.session.AuthState
import com.steadyai.app.session.AuthViewModel

@Composable
fun HomeScreen(
    authViewModel: AuthViewModel = hiltViewModel()
) {
    val authState by authViewModel.authState.collectAsState()

    Surface(modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                text = "Steady AI",
                style = MaterialTheme.typography.headlineMedium
            )

            Card(modifier = Modifier.fillMaxWidth()) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = "Home",
                        style = MaterialTheme.typography.titleLarge
                    )

                    when (val state = authState) {
                        AuthState.Loading -> Text("Checking session...")
                        AuthState.Unauthenticated -> Text("Signed out")
                        is AuthState.Authenticated -> Text("Signed in (${state.tokenPreview})")
                    }

                    Text(
                        text = "Next: connect dashboard modules and feature navigation.",
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            }

            Button(onClick = { authViewModel.logout() }) {
                Text("Logout")
            }
        }
    }
}
