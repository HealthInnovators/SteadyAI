package com.steadyai.data.user.repository

import com.steadyai.core.network.api.ApiService
import com.steadyai.core.network.client.ApiClient
import com.steadyai.core.network.model.ApiResult
import com.steadyai.domain.user.repository.UserRepository
import javax.inject.Inject

class UserRepositoryImpl @Inject constructor(
    private val apiService: ApiService,
    private val apiClient: ApiClient
) : UserRepository {
    override suspend fun getApiHealthStatus(): String {
        return when (val result = apiClient.execute { apiService.healthCheck() }) {
            is ApiResult.Success -> result.data.status
            is ApiResult.Failure -> throw IllegalStateException(result.error.message)
        }
    }
}
