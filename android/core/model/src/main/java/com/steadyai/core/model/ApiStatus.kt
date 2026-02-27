package com.steadyai.core.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class ApiStatus(
    @SerialName("status")
    val status: String
)
