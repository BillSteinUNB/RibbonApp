//
//  ContentView.swift
//  GymMark - Scientific Minimalism Design System
//
//  Main app structure with tab navigation
//

import SwiftUI

struct ContentView: View {
    @State private var selectedTab = 0
    @State private var showOnboarding = true
    @State private var onboardingStep = 0
    @State private var showActiveWorkout = false
    
    var body: some View {
        ZStack {
            if showOnboarding {
                onboardingFlow
            } else {
                mainAppView
            }
            
            // Active workout overlay
            if showActiveWorkout {
                ActiveWorkoutView(
                    onBack: {
                        showActiveWorkout = false
                    },
                    onFinish: {
                        showActiveWorkout = false
                    }
                )
                .transition(.move(edge: .trailing))
            }
        }
        .animation(.easeInOut(duration: 0.35), value: showOnboarding)
        .animation(.easeInOut(duration: 0.35), value: showActiveWorkout)
    }
    
    // MARK: - Onboarding Flow
    @ViewBuilder
    private var onboardingFlow: some View {
        switch onboardingStep {
        case 0:
            WelcomeView(
                onGetStarted: { onboardingStep = 1 },
                onSkip: { showOnboarding = false }
            )
            .transition(.asymmetric(
                insertion: .move(edge: .trailing),
                removal: .move(edge: .leading)
            ))
            
        case 1:
            HealthSetupView(
                onAllowAccess: { onboardingStep = 2 },
                onSkip: { onboardingStep = 2 }
            )
            .transition(.asymmetric(
                insertion: .move(edge: .trailing),
                removal: .move(edge: .leading)
            ))
            
        case 2:
            WeightGoalView(
                onContinue: { _ in showOnboarding = false }
            )
            .transition(.asymmetric(
                insertion: .move(edge: .trailing),
                removal: .move(edge: .leading)
            ))
            
        default:
            WelcomeView()
        }
    }
    
    // MARK: - Main App View
    private var mainAppView: some View {
        VStack(spacing: 0) {
            // Tab content
            TabView(selection: $selectedTab) {
                HomeDashboardView(
                    onStartWorkout: {
                        showActiveWorkout = true
                    }
                )
                .tag(0)
                
                WorkoutLibraryView()
                    .tag(1)
                
                HistoryView()
                    .tag(2)
                
                ProgressView()
                    .tag(3)
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            
            // Custom tab bar
            GymMarkTabBar(selectedTab: $selectedTab)
        }
        .ignoresSafeArea(.keyboard)
    }
}

// MARK: - App Entry Point
@main
struct GymMarkApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .preferredColorScheme(.dark)
        }
    }
}

// MARK: - Preview
#Preview {
    ContentView()
}

#Preview("Onboarding") {
    ContentView()
}

#Preview("Main App") {
    ContentView()
}
