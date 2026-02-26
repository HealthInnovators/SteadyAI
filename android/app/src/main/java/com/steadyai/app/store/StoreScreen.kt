package com.steadyai.app.store

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.steadyai.core.model.store.StoreProduct
import com.steadyai.core.network.api.ApiService
import com.steadyai.core.network.client.ApiClient
import com.steadyai.core.network.model.ApiResult
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class StoreUiState(
    val loading: Boolean = false,
    val error: String? = null,
    val products: List<StoreProduct> = emptyList()
)

@HiltViewModel
class StoreViewModel @Inject constructor(
    private val apiService: ApiService,
    private val apiClient: ApiClient
) : ViewModel() {
    private val _uiState = MutableStateFlow(StoreUiState(loading = true))
    val uiState: StateFlow<StoreUiState> = _uiState.asStateFlow()

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            _uiState.update { it.copy(loading = true, error = null) }
            when (val result = apiClient.execute { apiService.getStoreProducts() }) {
                is ApiResult.Success -> _uiState.update {
                    it.copy(
                        loading = false,
                        products = result.data.items,
                        error = null
                    )
                }

                is ApiResult.Failure -> _uiState.update { it.copy(loading = false, error = result.error.message) }
            }
        }
    }
}

@Composable
fun StoreScreen(viewModel: StoreViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsState()

    Surface(modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("Store", style = MaterialTheme.typography.titleLarge)
                Button(onClick = viewModel::refresh) { Text("Refresh") }
            }

            when {
                state.loading -> Text("Loading products...")
                state.error != null -> Text(state.error ?: "Unknown error", color = MaterialTheme.colorScheme.error)
                state.products.isEmpty() -> Text("No products available.")
                else -> LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    items(state.products, key = { it.id }) { product ->
                        Card(modifier = Modifier.fillMaxWidth()) {
                            Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                Text(product.name, style = MaterialTheme.typography.titleMedium)
                                Text(product.description, style = MaterialTheme.typography.bodyMedium)
                                Text("Who it's for: ${product.whoItsFor}", style = MaterialTheme.typography.labelMedium)
                                Text("Who it's not for: ${product.whoItsNotFor}", style = MaterialTheme.typography.labelSmall)
                            }
                        }
                    }
                }
            }
        }
    }
}
