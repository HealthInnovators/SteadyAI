package com.steadyai.app.session

import com.steadyai.core.network.auth.AuthTokenProvider
import com.steadyai.core.network.auth.MutableAuthTokenProvider
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SessionManager @Inject constructor(
    private val mutableAuthTokenProvider: MutableAuthTokenProvider,
    private val authTokenProvider: AuthTokenProvider
) {
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
}
