//
//  QuestionnaireView.swift
//  GymMark - Scientific Minimalism Design System
//
//  Gather preferences for program recommendations
//

import SwiftUI

struct QuestionnaireView: View {
    @State private var appeared = false
    @State private var selectedExperience: ExperienceLevel? = nil
    
    var onContinue: (ExperienceLevel) -> Void = { _ in }
    
    enum ExperienceLevel: String, CaseIterable {
        case beginner = "Beginner"
        case intermediate = "Intermediate"
        case advanced = "Advanced"
        
        var subtitle: String {
            switch self {
            case .beginner: return "Less than 6 months"
            case .intermediate: return "6 months - 2 years"
            case .advanced: return "2+ years"
            }
        }
    }
    
    var body: some View {
        ScreenContainer {
            VStack(spacing: 0) {
                Spacer()
                
                // Content
                VStack(spacing: GymMarkSpacing.xl) {
                    // Question
                    Text("What's your experience?")
                        .font(GymMarkTypography.h2)
                        .tracking(-1)
                        .foregroundColor(GymMarkColors.textPrimary)
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.5), value: appeared)
                    
                    // Options
                    VStack(spacing: GymMarkSpacing.sm) {
                        ForEach(Array(ExperienceLevel.allCases.enumerated()), id: \.element) { index, level in
                            OptionCard(
                                title: level.rawValue,
                                subtitle: level.subtitle,
                                isSelected: selectedExperience == level
                            ) {
                                selectedExperience = level
                            }
                            .opacity(appeared ? 1 : 0)
                            .offset(y: appeared ? 0 : 20)
                            .animation(
                                .easeOut(duration: 0.4).delay(0.1 + Double(index) * 0.08),
                                value: appeared
                            )
                        }
                    }
                    .padding(.horizontal, GymMarkSpacing.screenHorizontal)
                }
                
                Spacer()
                Spacer()
                
                // Continue button
                PrimaryButton(
                    title: "Continue",
                    action: {
                        if let experience = selectedExperience {
                            onContinue(experience)
                        }
                    },
                    disabled: selectedExperience == nil
                )
                .opacity(appeared ? 1 : 0)
                .animation(.easeOut(duration: 0.5).delay(0.4), value: appeared)
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
    QuestionnaireView()
}
