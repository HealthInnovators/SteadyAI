package com.steadyai.app.apikeys

import android.content.Context
import androidx.core.content.edit
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

enum class LlmProvider(val label: String) {
    OPENAI("OpenAI"),
    GEMINI("Google Gemini"),
    GROQ("Groq")
}

@Singleton
class ApiKeyStore @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val securePrefs by lazy {
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()

        EncryptedSharedPreferences.create(
            context,
            PREFS_FILE,
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }

    fun save(provider: LlmProvider, apiKey: String) {
        securePrefs.edit {
            putString(prefKeyFor(provider), apiKey.trim())
        }
    }

    fun clear(provider: LlmProvider) {
        securePrefs.edit {
            remove(prefKeyFor(provider))
        }
    }

    fun get(provider: LlmProvider): String? {
        return securePrefs.getString(prefKeyFor(provider), null)?.trim()?.takeIf { it.isNotEmpty() }
    }

    fun getMaskedPreview(provider: LlmProvider): String? {
        val value = get(provider) ?: return null
        return mask(value)
    }

    fun getMaskedPreviews(): Map<LlmProvider, String?> {
        return LlmProvider.entries.associateWith { getMaskedPreview(it) }
    }

    private fun prefKeyFor(provider: LlmProvider): String {
        return when (provider) {
            LlmProvider.OPENAI -> KEY_OPENAI
            LlmProvider.GEMINI -> KEY_GEMINI
            LlmProvider.GROQ -> KEY_GROQ
        }
    }

    private fun mask(value: String): String {
        return when {
            value.length <= 8 -> "${value.take(2)}****"
            else -> "${value.take(4)}...${value.takeLast(4)}"
        }
    }

    private companion object {
        const val PREFS_FILE = "steady_api_keys_secure_prefs"
        const val KEY_OPENAI = "openai_api_key"
        const val KEY_GEMINI = "gemini_api_key"
        const val KEY_GROQ = "groq_api_key"
    }
}
