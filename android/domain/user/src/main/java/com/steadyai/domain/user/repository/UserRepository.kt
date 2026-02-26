package com.steadyai.domain.user.repository

interface UserRepository {
    suspend fun getApiHealthStatus(): String
}
