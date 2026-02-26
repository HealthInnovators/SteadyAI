package com.steadyai.app.session

sealed interface AuthState {
    data object Loading : AuthState
    data object Unauthenticated : AuthState
    data class Authenticated(val tokenPreview: String) : AuthState
}
