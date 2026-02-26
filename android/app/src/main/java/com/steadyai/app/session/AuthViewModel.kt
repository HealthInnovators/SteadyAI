package com.steadyai.app.session

import androidx.lifecycle.ViewModel
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.StateFlow
import javax.inject.Inject

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authManager: AuthManager
) : ViewModel() {
    val authState: StateFlow<AuthState> = authManager.authState

    fun onLoginSuccess(jwt: String) {
        authManager.updateJwt(jwt)
    }

    fun logout() {
        authManager.logout()
    }
}
