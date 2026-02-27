plugins {
    alias(libs.plugins.android.library)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.serialization)
    alias(libs.plugins.hilt.android)
    alias(libs.plugins.kotlin.kapt)
}

val apiBaseUrl: String = (findProperty("STEADY_API_BASE_URL") as String?)
    ?: System.getenv("STEADY_API_BASE_URL")
    ?: "https://api.steadyai.dev/"

android {
    namespace = "com.steadyai.core.network"
    compileSdk = 35

    defaultConfig {
        minSdk = 26
        buildConfigField("String", "API_BASE_URL", "\"$apiBaseUrl\"")
    }

    buildFeatures {
        buildConfig = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation(project(":core:model"))

    implementation(libs.retrofit.core)
    implementation(libs.retrofit.kotlinx.serialization)
    implementation(libs.okhttp.core)
    implementation(libs.okhttp.logging)
    implementation(libs.serialization.json)

    implementation(libs.hilt.android)
    kapt(libs.hilt.compiler)
}
