package com.steadyai.app.community

import android.util.Base64
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.steadyai.app.community.data.CommunityRepository
import com.steadyai.app.session.SessionManager
import com.steadyai.core.model.community.CommunityPost
import com.steadyai.core.model.community.CommunityPostType
import com.steadyai.core.model.community.CommunityReaction
import com.steadyai.core.model.community.CommunityReactionType
import com.steadyai.core.network.model.ApiResult
import dagger.hilt.android.lifecycle.HiltViewModel
import java.nio.charset.StandardCharsets
import java.time.Instant
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import org.json.JSONObject

data class CommunityUiState(
    val loading: Boolean = false,
    val refreshing: Boolean = false,
    val loadingMore: Boolean = false,
    val creatingPost: Boolean = false,
    val error: String? = null,
    val createError: String? = null,
    val reactionError: String? = null,
    val posts: List<CommunityPost> = emptyList(),
    val groupId: String? = null,
    val challengeId: String? = null,
    val nextCursorCreatedAt: String? = null,
    val nextCursorId: String? = null,
    val selectedPostType: CommunityPostType = CommunityPostType.WIN,
    val draftContent: String = "",
    val currentUserId: String? = null,
    val createdPostSignal: Int = 0
) {
    val hasMore: Boolean
        get() = !nextCursorCreatedAt.isNullOrBlank() && !nextCursorId.isNullOrBlank()
}

@HiltViewModel
class CommunityViewModel @Inject constructor(
    private val repository: CommunityRepository,
    private val sessionManager: SessionManager
) : ViewModel() {
    private val _uiState = MutableStateFlow(CommunityUiState(loading = true))
    val uiState: StateFlow<CommunityUiState> = _uiState.asStateFlow()

    init {
        _uiState.update {
            it.copy(
                currentUserId = extractUserIdFromJwt(sessionManager.getAccessTokenOrNull())
            )
        }
        refresh()
    }

    fun refresh() {
        loadFeed(reset = true, pullToRefresh = false)
    }

    fun pullToRefresh() {
        loadFeed(reset = true, pullToRefresh = true)
    }

    fun loadMore() {
        val state = uiState.value
        if (state.loadingMore || state.loading || state.refreshing || !state.hasMore) {
            return
        }

        loadFeed(
            reset = false,
            pullToRefresh = false,
            cursorCreatedAt = state.nextCursorCreatedAt,
            cursorId = state.nextCursorId
        )
    }

    fun updateDraftContent(content: String) {
        _uiState.update { it.copy(draftContent = content, createError = null) }
    }

    fun selectPostType(type: CommunityPostType) {
        _uiState.update { it.copy(selectedPostType = type, createError = null) }
    }

    fun submitPost() {
        val state = uiState.value
        if (state.creatingPost) {
            return
        }

        val content = state.draftContent.trim()
        if (content.isEmpty()) {
            _uiState.update { it.copy(createError = "Write a short post before submitting") }
            return
        }

        if (content.length > 2000) {
            _uiState.update { it.copy(createError = "Post content must be 2000 characters or less") }
            return
        }

        viewModelScope.launch {
            _uiState.update { it.copy(creatingPost = true, createError = null) }
            when (val result = repository.createPost(type = state.selectedPostType, content = content)) {
                is ApiResult.Success -> {
                    _uiState.update { current ->
                        current.copy(
                            creatingPost = false,
                            draftContent = "",
                            posts = listOf(result.data) + current.posts.filterNot { it.id == result.data.id },
                            error = null,
                            createError = null,
                            createdPostSignal = current.createdPostSignal + 1
                        )
                    }
                }

                is ApiResult.Failure -> {
                    _uiState.update { it.copy(creatingPost = false, createError = result.error.message) }
                }
            }
        }
    }

    fun toggleReaction(postId: String, type: CommunityReactionType) {
        val userId = uiState.value.currentUserId
        if (userId.isNullOrBlank()) {
            _uiState.update { it.copy(reactionError = "Could not determine current user for reaction") }
            return
        }

        val state = uiState.value
        val targetPost = state.posts.firstOrNull { it.id == postId } ?: return
        val previousPosts = state.posts
        val existingReaction = targetPost.reactions.firstOrNull { it.userId == userId }
        val isRemoval = existingReaction?.type == type.name

        val optimisticPost = if (isRemoval) {
            targetPost.copy(reactions = targetPost.reactions.filterNot { it.userId == userId })
        } else {
            val updatedReaction = CommunityReaction(
                id = existingReaction?.id ?: "local:$postId:$userId",
                type = type.name,
                userId = userId,
                createdAt = existingReaction?.createdAt ?: Instant.now().toString()
            )

            targetPost.copy(
                reactions = targetPost.reactions
                    .filterNot { it.userId == userId }
                    .plus(updatedReaction)
            )
        }

        _uiState.update {
            it.copy(
                posts = replacePost(it.posts, optimisticPost),
                reactionError = null
            )
        }

        viewModelScope.launch {
            if (isRemoval) {
                when (val deleteResult = repository.deleteReaction(postId)) {
                    is ApiResult.Success -> Unit
                    is ApiResult.Failure -> {
                        _uiState.update {
                            it.copy(
                                posts = previousPosts,
                                reactionError = deleteResult.error.message
                            )
                        }
                    }
                }
            } else {
                when (val upsertResult = repository.upsertReaction(postId = postId, type = type)) {
                    is ApiResult.Success -> {
                        _uiState.update { current ->
                            current.copy(
                                posts = replaceReaction(
                                    posts = current.posts,
                                    postId = postId,
                                    userId = userId,
                                    reaction = upsertResult.data
                                )
                            )
                        }
                    }

                    is ApiResult.Failure -> {
                        _uiState.update {
                            it.copy(
                                posts = previousPosts,
                                reactionError = upsertResult.error.message
                            )
                        }
                    }
                }
            }
        }
    }

    private fun loadFeed(
        reset: Boolean,
        pullToRefresh: Boolean,
        cursorCreatedAt: String? = null,
        cursorId: String? = null
    ) {
        viewModelScope.launch {
            if (reset) {
                _uiState.update {
                    it.copy(
                        loading = !pullToRefresh && it.posts.isEmpty(),
                        refreshing = pullToRefresh,
                        loadingMore = false,
                        error = null
                    )
                }
            } else {
                _uiState.update { it.copy(loadingMore = true, error = null) }
            }

            when (
                val result = repository.getFeedPage(
                    limit = 20,
                    cursorCreatedAt = cursorCreatedAt,
                    cursorId = cursorId
                )
            ) {
                is ApiResult.Success -> {
                    _uiState.update { current ->
                        current.copy(
                            loading = false,
                            refreshing = false,
                            loadingMore = false,
                            posts = if (reset) {
                                result.data.posts
                            } else {
                                (current.posts + result.data.posts).distinctBy { it.id }
                            },
                            groupId = result.data.groupId,
                            challengeId = result.data.activeChallengeId,
                            nextCursorCreatedAt = result.data.nextCursorCreatedAt,
                            nextCursorId = result.data.nextCursorId,
                            error = null
                        )
                    }
                }

                is ApiResult.Failure -> {
                    _uiState.update {
                        it.copy(
                            loading = false,
                            refreshing = false,
                            loadingMore = false,
                            error = result.error.message
                        )
                    }
                }
            }
        }
    }

    private fun extractUserIdFromJwt(token: String?): String? {
        if (token.isNullOrBlank()) {
            return null
        }

        return try {
            val parts = token.split('.')
            if (parts.size < 2) {
                return null
            }

            val payloadBytes = Base64.decode(
                parts[1].replace('-', '+').replace('_', '/'),
                Base64.URL_SAFE or Base64.NO_WRAP or Base64.NO_PADDING
            )
            val payloadJson = JSONObject(String(payloadBytes, StandardCharsets.UTF_8))
            payloadJson.optString("sub").ifBlank {
                payloadJson.optString("userId")
            }.ifBlank {
                payloadJson.optString("uid")
            }.ifBlank {
                null
            }
        } catch (_: Exception) {
            null
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CommunityScreen(viewModel: CommunityViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsState()
    var showCreatePostModal by rememberSaveable { mutableStateOf(false) }

    LaunchedEffect(state.createdPostSignal) {
        if (state.createdPostSignal > 0) {
            showCreatePostModal = false
        }
    }

    Surface(modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Column {
                    Text("Community Feed", style = MaterialTheme.typography.titleLarge)
                    Text("Group: ${state.groupId ?: "-"}", style = MaterialTheme.typography.bodySmall)
                }
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(onClick = { showCreatePostModal = true }) {
                        Text("New post")
                    }
                    Button(onClick = viewModel::refresh, enabled = !state.loading && !state.refreshing) {
                        Text("Refresh")
                    }
                }
            }

            PullToRefreshBox(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                isRefreshing = state.refreshing,
                onRefresh = viewModel::pullToRefresh
            ) {
                when {
                    state.loading && state.posts.isEmpty() -> FeedStateMessage("Loading feed...")
                    state.posts.isEmpty() -> FeedStateMessage(state.error ?: "No posts yet. Create the first one.")
                    else -> CommunityFeedList(
                        state = state,
                        onToggleReaction = viewModel::toggleReaction,
                        onLoadMore = viewModel::loadMore
                    )
                }
            }
        }
    }

    if (showCreatePostModal) {
        CreatePostModal(
            selectedType = state.selectedPostType,
            draftContent = state.draftContent,
            creatingPost = state.creatingPost,
            error = state.createError,
            onDismiss = { showCreatePostModal = false },
            onSelectType = viewModel::selectPostType,
            onContentChanged = viewModel::updateDraftContent,
            onSubmit = viewModel::submitPost
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun CreatePostModal(
    selectedType: CommunityPostType,
    draftContent: String,
    creatingPost: Boolean,
    error: String?,
    onDismiss: () -> Unit,
    onSelectType: (CommunityPostType) -> Unit,
    onContentChanged: (String) -> Unit,
    onSubmit: () -> Unit
) {
    ModalBottomSheet(onDismissRequest = onDismiss) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text("Share an update", style = MaterialTheme.typography.titleMedium)
            Row(
                modifier = Modifier.horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                CommunityPostType.entries.forEach { type ->
                    FilterChip(
                        selected = selectedType == type,
                        onClick = { onSelectType(type) },
                        label = { Text(type.name) }
                    )
                }
            }

            OutlinedTextField(
                modifier = Modifier.fillMaxWidth(),
                value = draftContent,
                onValueChange = onContentChanged,
                minLines = 3,
                maxLines = 6,
                label = { Text("What happened today?") }
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "${draftContent.trim().length}/2000",
                    style = MaterialTheme.typography.labelSmall
                )
                Button(onClick = onSubmit, enabled = !creatingPost) {
                    if (creatingPost) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(18.dp),
                            strokeWidth = 2.dp
                        )
                    } else {
                        Text("Post")
                    }
                }
            }

            error?.let {
                Text(text = it, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
            }

            Button(
                onClick = onDismiss,
                enabled = !creatingPost,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Cancel")
            }
        }
    }
}

@Composable
private fun CommunityFeedList(
    state: CommunityUiState,
    onToggleReaction: (String, CommunityReactionType) -> Unit,
    onLoadMore: () -> Unit
) {
    LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        items(state.posts, key = { it.id }) { post ->
            CommunityPostCard(
                post = post,
                currentUserId = state.currentUserId,
                onToggleReaction = { type -> onToggleReaction(post.id, type) }
            )
        }

        item(key = "load-more") {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                when {
                    state.loadingMore -> CircularProgressIndicator()
                    state.hasMore -> Button(onClick = onLoadMore) { Text("Load more") }
                    else -> Text("You're up to date.")
                }

                if (state.error != null) {
                    Text(
                        text = state.error,
                        color = MaterialTheme.colorScheme.error,
                        style = MaterialTheme.typography.bodySmall
                    )
                }

                if (state.reactionError != null) {
                    Text(
                        text = state.reactionError,
                        color = MaterialTheme.colorScheme.error,
                        style = MaterialTheme.typography.bodySmall
                    )
                }
            }
        }
    }
}

@Composable
private fun CommunityPostCard(
    post: CommunityPost,
    currentUserId: String?,
    onToggleReaction: (CommunityReactionType) -> Unit
) {
    val myReactionType = post.reactions.firstOrNull { it.userId == currentUserId }?.type

    Card(modifier = Modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Text(
                text = post.author.displayName ?: post.author.username,
                style = MaterialTheme.typography.titleMedium,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            post.type?.let { Text(text = it, style = MaterialTheme.typography.labelMedium) }
            Text(text = post.content, style = MaterialTheme.typography.bodyMedium)
            Text(text = "${post.reactions.size} reactions", style = MaterialTheme.typography.labelSmall)

            Row(
                modifier = Modifier.horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                CommunityReactionType.entries.forEach { reactionType ->
                    val count = post.reactions.count { it.type == reactionType.name }
                    val selected = myReactionType == reactionType.name
                    FilterChip(
                        selected = selected,
                        onClick = { onToggleReaction(reactionType) },
                        label = {
                            Text(
                                if (count > 0) "${reactionType.name} $count" else reactionType.name
                            )
                        }
                    )
                }
            }

            val reactionSummary = buildReactionSummary(post)
            if (reactionSummary.isNotBlank()) {
                Text(text = reactionSummary, style = MaterialTheme.typography.bodySmall)
            }
        }
    }
}

private fun buildReactionSummary(post: CommunityPost): String {
    if (post.reactions.isEmpty()) {
        return ""
    }

    return post.reactions
        .groupingBy { it.type }
        .eachCount()
        .entries
        .sortedWith(compareByDescending<Map.Entry<String, Int>> { it.value }.thenBy { it.key })
        .joinToString(separator = " • ") { "${it.key} ${it.value}" }
}

private fun replacePost(posts: List<CommunityPost>, replacement: CommunityPost): List<CommunityPost> {
    return posts.map { post ->
        if (post.id == replacement.id) {
            replacement
        } else {
            post
        }
    }
}

private fun replaceReaction(
    posts: List<CommunityPost>,
    postId: String,
    userId: String,
    reaction: CommunityReaction
): List<CommunityPost> {
    return posts.map { post ->
        if (post.id != postId) {
            post
        } else {
            post.copy(
                reactions = post.reactions
                    .filterNot { it.userId == userId }
                    .plus(reaction)
            )
        }
    }
}

@Composable
private fun FeedStateMessage(message: String) {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Text(text = message)
    }
}
