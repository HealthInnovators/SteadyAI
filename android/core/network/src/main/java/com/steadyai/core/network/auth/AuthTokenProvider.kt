package com.steadyai.core.network.auth

import java.util.concurrent.atomic.AtomicReference
import javax.inject.Inject
import javax.inject.Singleton

interface AuthTokenProvider {
    fun getBearerToken(): String?
}

interface MutableAuthTokenProvider : AuthTokenProvider {
    fun updateBearerToken(token: String?)
}

@Singleton
class InMemoryAuthTokenProvider @Inject constructor() : MutableAuthTokenProvider {
    private val tokenRef = AtomicReference<String?>(null)

    override fun getBearerToken(): String? = tokenRef.get()?.trim()?.takeIf { it.isNotEmpty() }

    override fun updateBearerToken(token: String?) {
        tokenRef.set(token?.trim())
    }
}
