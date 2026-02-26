package com.steadyai.app.session

import android.content.Context
import androidx.core.content.edit
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthManager @Inject constructor(
    @ApplicationContext private val context: Context,
    private val sessionManager: SessionManager
) {
    private val ioScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    private val _authState = MutableStateFlow<AuthState>(AuthState.Loading)
    val authState: StateFlow<AuthState> = _authState.asStateFlow()

    private val securePrefs by lazy {
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()

        EncryptedSharedPreferences.create(
            context,
            PREFS_FILE,
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }

    init {
        ioScope.launch {
            val token = securePrefs.getString(KEY_JWT, null)
            if (token.isNullOrBlank()) {
                sessionManager.clearSession()
                _authState.value = AuthState.Unauthenticated
            } else {
                sessionManager.setAccessToken(token)
                _authState.value = AuthState.Authenticated(tokenPreview = token.preview())
            }
        }
    }

    fun updateJwt(token: String) {
        val normalized = token.trim()
        if (normalized.isBlank()) {
            return
        }

        ioScope.launch {
            securePrefs.edit { putString(KEY_JWT, normalized) }
            sessionManager.setAccessToken(normalized)
            _authState.value = AuthState.Authenticated(tokenPreview = normalized.preview())
        }
    }

    fun logout() {
        ioScope.launch {
            securePrefs.edit { remove(KEY_JWT) }
            sessionManager.clearSession()
            _authState.value = AuthState.Unauthenticated
        }
    }

    private fun String.preview(): String {
        return if (length <= 12) {
            this
        } else {
            "${take(6)}...${takeLast(4)}"
        }
    }

    private companion object {
        const val PREFS_FILE = "steady_auth_secure_prefs"
        const val KEY_JWT = "jwt_token"
    }
}
