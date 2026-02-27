package com.steadyai.core.model.store

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class StoreProductsResponse(
    @SerialName("items")
    val items: List<StoreProduct> = emptyList()
)

@Serializable
data class StoreProduct(
    @SerialName("id")
    val id: String,
    @SerialName("name")
    val name: String,
    @SerialName("description")
    val description: String,
    @SerialName("whoItsFor")
    val whoItsFor: String,
    @SerialName("whoItsNotFor")
    val whoItsNotFor: String
)
