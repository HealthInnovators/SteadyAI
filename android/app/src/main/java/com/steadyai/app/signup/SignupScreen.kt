package com.steadyai.app.signup

import android.app.Activity
import android.content.Context
import android.content.ContextWrapper
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import com.steadyai.app.R
import com.steadyai.app.session.AuthManager
import com.steadyai.core.model.auth.GoogleSignupRequest
import com.steadyai.core.network.api.ApiService
import com.steadyai.core.network.client.ApiClient
import com.steadyai.core.network.model.ApiResult
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class SignupUiState(
    val isLoading: Boolean = false,
    val errorMessage: String? = null
)

sealed interface SignupEvent {
    data object NavigateToOnboarding : SignupEvent
}

@HiltViewModel
class SignupViewModel @Inject constructor(
    private val apiService: ApiService,
    private val apiClient: ApiClient,
    private val authManager: AuthManager
) : ViewModel() {
    private val _uiState = MutableStateFlow(SignupUiState())
    val uiState: StateFlow<SignupUiState> = _uiState.asStateFlow()

    private val _events = MutableSharedFlow<SignupEvent>()
    val events: SharedFlow<SignupEvent> = _events.asSharedFlow()

    fun onGoogleSignInFailure(message: String) {
        _uiState.update {
            it.copy(
                isLoading = false,
                errorMessage = message
            )
        }
    }

    fun onGoogleIdTokenReceived(idToken: String?) {
        val normalizedToken = idToken?.trim()
        if (normalizedToken.isNullOrEmpty()) {
            onGoogleSignInFailure("Google sign-in did not provide an ID token.")
            return
        }

        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }

            when (
                val result = apiClient.execute {
                    apiService.signupWithGoogle(GoogleSignupRequest(idToken = normalizedToken))
                }
            ) {
                is ApiResult.Success -> {
                    val jwt = result.data.resolvedJwt()
                    if (jwt.isNullOrBlank()) {
                        _uiState.update {
                            it.copy(
                                isLoading = false,
                                errorMessage = "Signup succeeded but no JWT was returned."
                            )
                        }
                        return@launch
                    }

                    authManager.updateJwt(jwt)
                    _uiState.update { it.copy(isLoading = false, errorMessage = null) }
                    _events.emit(SignupEvent.NavigateToOnboarding)
                }

                is ApiResult.Failure -> {
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            errorMessage = result.error.message
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun SignupRoute(
    onSignupSuccess: () -> Unit,
    viewModel: SignupViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    val activity = context.findActivity()
    val uiState by viewModel.uiState.collectAsState()

    val googleSignInClient = remember(context) {
        GoogleSignIn.getClient(
            context,
            GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestEmail()
                .requestIdToken(context.getString(R.string.google_web_client_id))
                .build()
        )
    }

    val launcher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode != Activity.RESULT_OK || result.data == null) {
            viewModel.onGoogleSignInFailure("Google sign-in was cancelled.")
            return@rememberLauncherForActivityResult
        }

        try {
            val accountTask = GoogleSignIn.getSignedInAccountFromIntent(result.data)
            val account = accountTask.getResult(ApiException::class.java)
            viewModel.onGoogleIdTokenReceived(account.idToken)
        } catch (apiException: ApiException) {
            viewModel.onGoogleSignInFailure(
                "Google sign-in failed (${apiException.statusCode})."
            )
        } catch (_: Exception) {
            viewModel.onGoogleSignInFailure("Google sign-in failed unexpectedly.")
        }
    }

    LaunchedEffect(Unit) {
        viewModel.events.collect { event ->
            if (event is SignupEvent.NavigateToOnboarding) {
                onSignupSuccess()
            }
        }
    }

    SignupScreen(
        state = uiState,
        onGoogleSignupClick = {
            if (activity == null) {
                viewModel.onGoogleSignInFailure("Unable to start Google sign-in.")
            } else {
                googleSignInClient.signOut().addOnCompleteListener(activity) {
                    launcher.launch(googleSignInClient.signInIntent)
                }
            }
        }
    )
}

@Composable
private fun SignupScreen(
    state: SignupUiState,
    onGoogleSignupClick: () -> Unit
) {
    Surface(modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            Text(
                text = "Create your account",
                style = MaterialTheme.typography.headlineSmall
            )
            Text(
                text = "Sign up with your Gmail account to continue.",
                style = MaterialTheme.typography.bodyMedium
            )

            Button(
                onClick = onGoogleSignupClick,
                enabled = !state.isLoading,
                modifier = Modifier.fillMaxWidth()
            ) {
                if (state.isLoading) {
                    CircularProgressIndicator(strokeWidth = 2.dp)
                } else {
                    Text("Continue with Google")
                }
            }

            state.errorMessage?.let { message ->
                Text(
                    text = message,
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodyMedium,
                    textAlign = TextAlign.Start
                )
            }
        }
    }
}

private fun Context.findActivity(): Activity? {
    var currentContext: Context? = this
    while (currentContext is ContextWrapper) {
        if (currentContext is Activity) {
            return currentContext
        }
        currentContext = currentContext.baseContext
    }
    return null
}
