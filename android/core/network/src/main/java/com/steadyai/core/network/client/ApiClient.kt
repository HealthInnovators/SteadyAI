package com.steadyai.core.network.client

import com.steadyai.core.network.model.ApiError
import com.steadyai.core.network.model.ApiErrorType
import com.steadyai.core.network.model.ApiResult
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import retrofit2.Response
import java.io.IOException
import java.net.SocketTimeoutException
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ApiClient @Inject constructor(
    private val json: Json
) {
    suspend fun <T> execute(request: suspend () -> Response<T>): ApiResult<T> {
        return try {
            val response = request()
            if (response.isSuccessful) {
                val body = response.body()
                if (body != null) {
                    ApiResult.Success(data = body, httpCode = response.code())
                } else {
                    ApiResult.Failure(
                        ApiError(
                            type = ApiErrorType.SERIALIZATION,
                            message = "Response body is empty",
                            httpCode = response.code()
                        )
                    )
                }
            } else {
                ApiResult.Failure(normalizeHttpError(response))
            }
        } catch (_: SocketTimeoutException) {
            ApiResult.Failure(
                ApiError(
                    type = ApiErrorType.TIMEOUT,
                    message = "Request timed out"
                )
            )
        } catch (_: IOException) {
            ApiResult.Failure(
                ApiError(
                    type = ApiErrorType.NETWORK,
                    message = "Network error"
                )
            )
        } catch (error: Exception) {
            ApiResult.Failure(
                ApiError(
                    type = ApiErrorType.UNKNOWN,
                    message = error.message ?: "Unknown error"
                )
            )
        }
    }

    private fun <T> normalizeHttpError(response: Response<T>): ApiError {
        val body = try {
            response.errorBody()?.string()
        } catch (_: Exception) {
            null
        }

        val normalizedMessage = body
            ?.let { parseErrorMessage(it) }
            ?: response.message()
            .ifBlank { "Request failed" }

        val type = when (response.code()) {
            401 -> ApiErrorType.UNAUTHORIZED
            else -> ApiErrorType.HTTP
        }

        return ApiError(
            type = type,
            message = normalizedMessage,
            httpCode = response.code(),
            rawBody = body
        )
    }

    private fun parseErrorMessage(rawBody: String): String {
        return try {
            val jsonObject = json.parseToJsonElement(rawBody).jsonObject
            when {
                "error" in jsonObject -> jsonObject.getValue("error").jsonPrimitive.content
                "message" in jsonObject -> jsonObject.getValue("message").jsonPrimitive.content
                "detail" in jsonObject -> jsonObject.getValue("detail").jsonPrimitive.content
                else -> rawBody
            }
        } catch (_: Exception) {
            rawBody
        }
    }
}
