//
//  WelcomeView.swift
//  GymMark - Scientific Minimalism Design System
//
//  Onboarding Step 1: Brand introduction and emotional hook
//

import SwiftUI

struct WelcomeView: View {
    @State private var appeared = false
    var onGetStarted: () -> Void = {}
    var onSkip: () -> Void = {}
    
    var body: some View {
        ScreenContainer {
            VStack(spacing: 0) {
                Spacer()
                
                // Main content (centered)
                VStack(spacing: GymMarkSpacing.xl) {
                    // App logo
                    AppLogoIcon(size: 100)
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 20)
                        .animation(.easeOut(duration: 0.6), value: appeared)
                    
                    // Text content
                    VStack(spacing: GymMarkSpacing.sm) {
                        Text("GymMark")
                            .font(GymMarkTypography.h1)
                            .tracking(-1.5)
                            .foregroundColor(GymMarkColors.textPrimary)
                        
                        Text("Track your strength journey\nwith scientific precision")
                            .font(GymMarkTypography.bodyLarge)
                            .foregroundColor(GymMarkColors.textSecondary)
                            .multilineTextAlignment(.center)
                            .lineSpacing(4)
                    }
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : 20)
                    .animation(.easeOut(duration: 0.6).delay(0.15), value: appeared)
                }
                
                Spacer()
                Spacer()
                
                // Bottom buttons
                VStack(spacing: GymMarkSpacing.md) {
                    SecondaryButton(title: "Skip", action: onSkip)
                    PrimaryButton(title: "Get Started", action: onGetStarted)
                    
                    // Page indicator
                    PageIndicator(totalPages: 3, currentPage: 0)
                        .padding(.top, GymMarkSpacing.md)
                }
                .opacity(appeared ? 1 : 0)
                .animation(.easeOut(duration: 0.6).delay(0.3), value: appeared)
                .padding(.horizontal, GymMarkSpacing.screenHorizontal)
                .padding(.bottom, GymMarkSpacing.xl)
            }
        }
        .onAppear {
            appeared = true
        }
    }
}

// MARK: - Preview
#Preview {
    WelcomeView()
}

#Preview("Dark Mode") {
    WelcomeView()
        .preferredColorScheme(.dark)
}
