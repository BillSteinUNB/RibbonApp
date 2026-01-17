//
//  TDEECalculatorView.swift
//  GymMark - Scientific Minimalism Design System
//
//  Calculate daily calorie target
//

import SwiftUI

struct TDEECalculatorView: View {
    @State private var appeared = false
    @State private var gender = "Male"
    @State private var age = ""
    @State private var height = ""
    @State private var weight = ""
    @State private var activityLevel: ActivityLevel = .lightlyActive
    @State private var showResult = false
    
    enum ActivityLevel: String, CaseIterable {
        case sedentary = "Sedentary"
        case lightlyActive = "Lightly Active"
        case moderatelyActive = "Moderately Active"
        case veryActive = "Very Active"
        case extremelyActive = "Extremely Active"
        
        var subtitle: String {
            switch self {
            case .sedentary: return "Office job, little exercise"
            case .lightlyActive: return "1-3 days/week"
            case .moderatelyActive: return "3-5 days/week"
            case .veryActive: return "6-7 days/week"
            case .extremelyActive: return "Athlete level"
            }
        }
        
        var multiplier: Double {
            switch self {
            case .sedentary: return 1.2
            case .lightlyActive: return 1.375
            case .moderatelyActive: return 1.55
            case .veryActive: return 1.725
            case .extremelyActive: return 1.9
            }
        }
    }
    
    private var calculatedTDEE: Int {
        guard let ageValue = Double(age),
              let weightValue = Double(weight),
              let heightValue = Double(height) else {
            return 0
        }
        
        // Mifflin-St Jeor equation
        let bmr: Double
        if gender == "Male" {
            bmr = 10 * (weightValue * 0.453592) + 6.25 * (heightValue * 2.54) - 5 * ageValue + 5
        } else {
            bmr = 10 * (weightValue * 0.453592) + 6.25 * (heightValue * 2.54) - 5 * ageValue - 161
        }
        
        return Int(bmr * activityLevel.multiplier)
    }
    
    private var isFormValid: Bool {
        !age.isEmpty && !height.isEmpty && !weight.isEmpty
    }
    
    var body: some View {
        ScreenContainer {
            VStack(spacing: 0) {
                // Header
                NavigationHeader(title: "TDEE Calculator", showBackButton: true)
                
                ScrollView(showsIndicators: false) {
                    VStack(spacing: GymMarkSpacing.lg) {
                        // Gender
                        inputSection(title: "Gender") {
                            GymMarkSegmentedControl(
                                options: ["Male", "Female"],
                                selectedOption: $gender
                            )
                        }
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.4), value: appeared)
                        
                        // Age
                        inputSection(title: "Age") {
                            NumericInputField(value: $age, unit: "years", width: 80)
                        }
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.4).delay(0.05), value: appeared)
                        
                        // Height
                        inputSection(title: "Height") {
                            NumericInputField(value: $height, unit: "in", width: 80)
                        }
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.4).delay(0.1), value: appeared)
                        
                        // Weight
                        inputSection(title: "Weight") {
                            NumericInputField(value: $weight, unit: "lbs", width: 80)
                        }
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.4).delay(0.15), value: appeared)
                        
                        // Activity Level
                        VStack(alignment: .leading, spacing: GymMarkSpacing.sm) {
                            Text("Activity Level")
                                .labelStyle()
                            
                            ForEach(ActivityLevel.allCases, id: \.self) { level in
                                OptionCard(
                                    title: level.rawValue,
                                    subtitle: level.subtitle,
                                    isSelected: activityLevel == level
                                ) {
                                    activityLevel = level
                                }
                            }
                        }
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.4).delay(0.2), value: appeared)
                        
                        // Result
                        if showResult && isFormValid {
                            TDEEResultCard(tdee: calculatedTDEE)
                                .opacity(appeared ? 1 : 0)
                                .animation(.easeOut(duration: 0.5), value: showResult)
                        }
                        
                        // Bottom padding
                        Spacer().frame(height: GymMarkSpacing.xxl + GymMarkSpacing.buttonHeight)
                    }
                    .padding(.horizontal, GymMarkSpacing.screenHorizontal)
                    .padding(.top, GymMarkSpacing.lg)
                }
                
                // Calculate button
                FilledButton(
                    title: showResult ? "Recalculate" : "Calculate TDEE",
                    action: {
                        withAnimation {
                            showResult = true
                        }
                    },
                    disabled: !isFormValid
                )
                .padding(.horizontal, GymMarkSpacing.screenHorizontal)
                .padding(.vertical, GymMarkSpacing.md)
                .background(GymMarkColors.background)
            }
        }
        .onAppear {
            appeared = true
        }
    }
    
    private func inputSection<Content: View>(title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: GymMarkSpacing.xs) {
            Text(title)
                .labelStyle()
            
            content()
        }
    }
}

// MARK: - TDEE Result Card
struct TDEEResultCard: View {
    let tdee: Int
    
    var body: some View {
        VStack(spacing: GymMarkSpacing.md) {
            Text("Your TDEE")
                .labelStyle()
            
            Text("\(tdee)")
                .font(GymMarkTypography.dataLarge)
                .foregroundColor(GymMarkColors.textPrimary)
            
            Text("calories/day")
                .font(GymMarkTypography.body)
                .foregroundColor(GymMarkColors.textSecondary)
            
            Text("Based on your inputs, this is your estimated daily calorie maintenance level")
                .font(GymMarkTypography.bodySmall)
                .foregroundColor(GymMarkColors.textTertiary)
                .multilineTextAlignment(.center)
                .padding(.top, GymMarkSpacing.xs)
        }
        .frame(maxWidth: .infinity)
        .gymMarkCard(elevated: true)
    }
}

// MARK: - Preview
#Preview {
    TDEECalculatorView()
}
