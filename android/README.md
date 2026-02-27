# Steady AI Android (Kotlin + Compose)

Native Android scaffold using:
- MVVM + Repository Pattern + Clean Architecture
- Hilt DI
- Retrofit + OkHttp
- Kotlinx Serialization
- Jetpack Navigation

## Modules
- `:app`
- `:core:common`
- `:core:model`
- `:core:network`
- `:domain:user`
- `:data:user`

## API Base URL (Environment-Based)
`core:network` reads `STEADY_API_BASE_URL` from:
1. Gradle property `STEADY_API_BASE_URL`
2. Environment variable `STEADY_API_BASE_URL`
3. Fallback `https://api.steadyai.dev/`

Example:
```bash
export STEADY_API_BASE_URL="https://your-api.example.com/"
```

## Notes
- This scaffold intentionally includes no product UI yet.
- Navigation and app bootstrap are wired with an empty `BootstrapScreen`.
