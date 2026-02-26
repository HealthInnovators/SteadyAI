package com.steadyai.core.network.model

sealed interface ApiResult<out T> {
    data class Success<T>(
        val data: T,
        val httpCode: Int
    ) : ApiResult<T>

    data class Failure(
        val error: ApiError
    ) : ApiResult<Nothing>
}

enum class ApiErrorType {
    UNAUTHORIZED,
    TIMEOUT,
    NETWORK,
    HTTP,
    SERIALIZATION,
    UNKNOWN
}

data class ApiError(
    val type: ApiErrorType,
    val message: String,
    val httpCode: Int? = null,
    val rawBody: String? = null
)
