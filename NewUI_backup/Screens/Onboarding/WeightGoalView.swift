//
//  WeightGoalView.swift
//  GymMark - Scientific Minimalism Design System
//
//  Onboarding Step 3: Weight goal direction selection
//

import SwiftUI

struct WeightGoalView: View {
    @State private var appeared = false
    @State private var selectedGoal: WeightGoal? = nil
    
    var onContinue: (WeightGoal) -> Void = { _ in }
    
    enum WeightGoal: String, CaseIterable {
        case lose = "Lose Weight"
        case gain = "Gain Weight"
        case maintain = "Maintain"
        
        var subtitle: String {
            switch self {
            case .lose: return "Caloric deficit"
            case .gain: return "Caloric surplus"
            case .maintain: return "Stay consistent"
            }
        }
        
        var direction: GoalCard.GoalDirection {
            switch self {
            case .lose: return .down
            case .gain: return .up
            case .maintain: return .maintain
            }
        }
    }
    
    var body: some View {
        ScreenContainer {
            VStack(spacing: 0) {
                Spacer()
                
                // Main content (centered)
                VStack(spacing: GymMarkSpacing.xl) {
                    // Feature icon
                    FeatureIcon(systemName: "scalemass", size: 80)
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 20)
                        .animation(.easeOut(duration: 0.6), value: appeared)
                    
                    // Text content
                    VStack(spacing: GymMarkSpacing.sm) {
                        Text("Your Goal")
                            .font(GymMarkTypography.h2)
                            .tracking(-1)
                            .foregroundColor(GymMarkColors.textPrimary)
                        
                        Text("What's your primary focus?")
                            .font(GymMarkTypography.body)
                            .foregroundColor(GymMarkColors.textSecondary)
                    }
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : 20)
                    .animation(.easeOut(duration: 0.6).delay(0.1), value: appeared)
                    
                    // Goal selection cards
                    VStack(spacing: GymMarkSpacing.sm) {
                        ForEach(Array(WeightGoal.allCases.enumerated()), id: \.element) { index, goal in
                            GoalCard(
                                title: goal.rawValue,
                                subtitle: goal.subtitle,
                                direction: goal.direction,
                                isSelected: selectedGoal == goal
                            ) {
                                selectedGoal = goal
                            }
                            .opacity(appeared ? 1 : 0)
                            .offset(y: appeared ? 0 : 20)
                            .animation(
                                .easeOut(duration: 0.5).delay(0.2 + Double(index) * 0.08),
                                value: appeared
                            )
                        }
                    }
                    .padding(.horizontal, GymMarkSpacing.screenHorizontal)
                }
                
                Spacer()
                Spacer()
                
                // Bottom button
                VStack(spacing: GymMarkSpacing.md) {
                    PrimaryButton(
                        title: "Continue",
                        action: {
                            if let goal = selectedGoal {
                                onContinue(goal)
                            }
                        },
                        disabled: selectedGoal == nil
                    )
                    
                    // Page indicator
                    PageIndicator(totalPages: 3, currentPage: 2)
                        .padding(.top, GymMarkSpacing.md)
                }
                .opacity(appeared ? 1 : 0)
                .animation(.easeOut(duration: 0.6).delay(0.4), value: appeared)
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
    WeightGoalView()
}

#Preview("With Selection") {
    WeightGoalView()
}
