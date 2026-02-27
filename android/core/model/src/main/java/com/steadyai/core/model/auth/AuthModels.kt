package com.steadyai.core.model.auth

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class GoogleSignupRequest(
    @SerialName("idToken")
    val idToken: String
)

@Serializable
data class GoogleSignupResponse(
    @SerialName("jwt")
    val jwt: String? = null,
    @SerialName("token")
    val token: String? = null,
    @SerialName("accessToken")
    val accessToken: String? = null
) {
    fun resolvedJwt(): String? {
        return sequenceOf(jwt, token, accessToken)
            .mapNotNull { it?.trim() }
            .firstOrNull { it.isNotEmpty() }
    }
}
