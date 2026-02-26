package com.steadyai.app

import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.steadyai.app.onboarding.OnboardingRoute
import com.steadyai.app.shell.MainShellScreen

private const val ONBOARDING_ROUTE = "onboarding"
private const val HOME_ROUTE = "home"

@Composable
fun SteadyNavHost() {
    val navController = rememberNavController()

    NavHost(
        navController = navController,
        startDestination = ONBOARDING_ROUTE
    ) {
        composable(ONBOARDING_ROUTE) {
            OnboardingRoute(
                onComplete = {
                    navController.navigate(HOME_ROUTE) {
                        popUpTo(ONBOARDING_ROUTE) { inclusive = true }
                    }
                }
            )
        }
        composable(HOME_ROUTE) {
            MainShellScreen()
        }
    }
}
