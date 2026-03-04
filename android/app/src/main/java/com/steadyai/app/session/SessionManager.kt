package com.steadyai.app.session

import com.steadyai.core.network.auth.AuthTokenProvider
import com.steadyai.core.network.auth.MutableAuthTokenProvider
import javax.inject.Inject
import javax.inject.Singleton
import android.content.Context
import dagger.hilt.android.qualifiers.ApplicationContext

@Singleton
class SessionManager @Inject constructor(
    @ApplicationContext private val appContext: Context,
    private val mutableAuthTokenProvider: MutableAuthTokenProvider,
    private val authTokenProvider: AuthTokenProvider
) {
    private val prefs by lazy {
        appContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }

    fun setAccessToken(token: String) {
        mutableAuthTokenProvider.updateBearerToken(token)
    }

    fun clearSession() {
        mutableAuthTokenProvider.updateBearerToken(null)
    }

    fun isAuthenticated(): Boolean {
        return authTokenProvider.getBearerToken() != null
    }

    fun getAccessTokenOrNull(): String? {
        return authTokenProvider.getBearerToken()
    }

    fun setCurrentUserId(userId: String?) {
        val normalized = userId?.trim()?.takeIf { it.isNotEmpty() }
        prefs.edit().putString(KEY_USER_ID, normalized).apply()
    }

    fun getCurrentUserIdOrNull(): String? {
        return prefs.getString(KEY_USER_ID, null)?.trim()?.takeIf { it.isNotEmpty() }
    }

    private companion object {
        const val PREFS_NAME = "steady_session_prefs"
        const val KEY_USER_ID = "current_user_id"
    }
}
