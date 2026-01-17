//
//  HealthSetupView.swift
//  GymMark - Scientific Minimalism Design System
//
//  Onboarding Step 2: HealthKit integration and data import
//

import SwiftUI

struct HealthSetupView: View {
    @State private var appeared = false
    @State private var selectedTimeframe: HealthTimeframe = .threeMonths
    
    var onAllowAccess: () -> Void = {}
    var onSkip: () -> Void = {}
    
    enum HealthTimeframe: String, CaseIterable {
        case oneWeek = "1 Week"
        case oneMonth = "1 Month"
        case threeMonths = "3 Months"
        case oneYear = "1 Year"
        case allTime = "All Time"
    }
    
    var body: some View {
        ScreenContainer {
            VStack(spacing: 0) {
                Spacer()
                
                // Main content (centered)
                VStack(spacing: GymMarkSpacing.xl) {
                    // Feature icon
                    FeatureIcon(systemName: "heart", size: 80)
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 20)
                        .animation(.easeOut(duration: 0.6), value: appeared)
                    
                    // Text content
                    VStack(spacing: GymMarkSpacing.sm) {
                        Text("Connect Health")
                            .font(GymMarkTypography.h2)
                            .tracking(-1)
                            .foregroundColor(GymMarkColors.textPrimary)
                        
                        Text("Import your existing weight and nutrition data from Apple Health")
                            .font(GymMarkTypography.body)
                            .foregroundColor(GymMarkColors.textSecondary)
                            .multilineTextAlignment(.center)
                            .lineSpacing(4)
                    }
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : 20)
                    .animation(.easeOut(duration: 0.6).delay(0.1), value: appeared)
                    .padding(.horizontal, GymMarkSpacing.lg)
                    
                    // Timeframe selection
                    VStack(spacing: GymMarkSpacing.xs) {
                        ForEach(HealthTimeframe.allCases, id: \.self) { timeframe in
                            TimeframePill(
                                title: timeframe.rawValue,
                                isSelected: selectedTimeframe == timeframe
                            ) {
                                selectedTimeframe = timeframe
                            }
                        }
                    }
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : 20)
                    .animation(.easeOut(duration: 0.6).delay(0.2), value: appeared)
                    .padding(.horizontal, GymMarkSpacing.xxl)
                }
                
                Spacer()
                Spacer()
                
                // Bottom buttons
                VStack(spacing: GymMarkSpacing.md) {
                    SecondaryButton(title: "Skip", action: onSkip)
                    PrimaryButton(title: "Allow Access", action: onAllowAccess)
                    
                    // Page indicator
                    PageIndicator(totalPages: 3, currentPage: 1)
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
    HealthSetupView()
}
