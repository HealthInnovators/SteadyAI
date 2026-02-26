package com.steadyai.domain.user.usecase

import com.steadyai.domain.user.repository.UserRepository
import javax.inject.Inject

class GetApiHealthStatusUseCase @Inject constructor(
    private val userRepository: UserRepository
) {
    suspend operator fun invoke(): String = userRepository.getApiHealthStatus()
}
