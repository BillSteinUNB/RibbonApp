//
//  GymMarkTextField.swift
//  GymMark - Scientific Minimalism Design System
//
//  Custom styled text input fields
//

import SwiftUI

// MARK: - Standard Text Field
struct GymMarkTextField: View {
    let placeholder: String
    @Binding var text: String
    var icon: String? = nil
    var keyboardType: UIKeyboardType = .default
    
    @FocusState private var isFocused: Bool
    
    var body: some View {
        HStack(spacing: GymMarkSpacing.iconTextGap) {
            if let icon = icon {
                Image(systemName: icon)
                    .font(.system(size: 18, weight: .light))
                    .foregroundColor(GymMarkColors.textSecondary)
                    .frame(width: 24)
            }
            
            TextField("", text: $text, prompt: Text(placeholder).foregroundColor(GymMarkColors.textTertiary))
                .font(GymMarkTypography.body)
                .foregroundColor(GymMarkColors.textPrimary)
                .keyboardType(keyboardType)
                .focused($isFocused)
        }
        .padding(.horizontal, GymMarkSpacing.md)
        .padding(.vertical, GymMarkSpacing.sm)
        .background(
            RoundedRectangle(cornerRadius: GymMarkSpacing.inputRadius)
                .fill(GymMarkColors.inputBackground)
                .overlay(
                    RoundedRectangle(cornerRadius: GymMarkSpacing.inputRadius)
                        .stroke(
                            isFocused ? GymMarkColors.textSecondary : GymMarkColors.cardBorder,
                            lineWidth: 1
                        )
                )
        )
        .animation(GymMarkAnimation.selection, value: isFocused)
    }
}

// MARK: - Numeric Input Field
struct NumericInputField: View {
    @Binding var value: String
    let unit: String
    var placeholder: String = ""
    var width: CGFloat = 80
    
    @FocusState private var isFocused: Bool
    
    var body: some View {
        HStack(spacing: GymMarkSpacing.xxs) {
            TextField(placeholder, text: $value)
                .font(GymMarkTypography.dataSmall)
                .foregroundColor(GymMarkColors.textPrimary)
                .keyboardType(.decimalPad)
                .multilineTextAlignment(.center)
                .frame(width: width)
                .padding(.vertical, GymMarkSpacing.xs)
                .background(
                    RoundedRectangle(cornerRadius: GymMarkSpacing.inputRadius)
                        .fill(GymMarkColors.inputBackground)
                        .overlay(
                            RoundedRectangle(cornerRadius: GymMarkSpacing.inputRadius)
                                .stroke(
                                    isFocused ? GymMarkColors.textSecondary : GymMarkColors.cardBorder,
                                    lineWidth: 1
                                )
                        )
                )
                .focused($isFocused)
            
            Text(unit)
                .font(GymMarkTypography.bodySmall)
                .foregroundColor(GymMarkColors.textTertiary)
        }
        .animation(GymMarkAnimation.selection, value: isFocused)
    }
}

// MARK: - Workout Set Input Row
struct WorkoutSetInputRow: View {
    let setNumber: Int
    @Binding var weight: String
    @Binding var reps: String
    var isPR: Bool = false
    var isCompleted: Bool = false
    var weightUnit: String = "lbs"
    
    var body: some View {
        HStack(spacing: GymMarkSpacing.md) {
            // Set number
            Text("Set \(setNumber)")
                .font(GymMarkTypography.body)
                .foregroundColor(isCompleted ? GymMarkColors.textSecondary : GymMarkColors.textPrimary)
                .frame(width: 50, alignment: .leading)
            
            // Weight input
            NumericInputField(value: $weight, unit: weightUnit, width: 60)
            
            // Multiplier
            Text("×")
                .font(GymMarkTypography.body)
                .foregroundColor(GymMarkColors.textTertiary)
            
            // Reps input
            NumericInputField(value: $reps, unit: "", placeholder: "", width: 50)
            
            Spacer()
            
            // PR badge
            if isPR {
                HStack(spacing: 4) {
                    Image(systemName: "trophy.fill")
                        .font(.system(size: 12))
                    Text("PR")
                        .font(GymMarkTypography.caption)
                }
                .foregroundColor(GymMarkColors.success)
            }
        }
    }
}

// MARK: - Text Area
struct GymMarkTextArea: View {
    let placeholder: String
    @Binding var text: String
    var minHeight: CGFloat = 100
    
    @FocusState private var isFocused: Bool
    
    var body: some View {
        TextEditor(text: $text)
            .font(GymMarkTypography.body)
            .foregroundColor(GymMarkColors.textPrimary)
            .scrollContentBackground(.hidden)
            .frame(minHeight: minHeight)
            .padding(GymMarkSpacing.sm)
            .background(
                RoundedRectangle(cornerRadius: GymMarkSpacing.inputRadius)
                    .fill(GymMarkColors.inputBackground)
                    .overlay(
                        RoundedRectangle(cornerRadius: GymMarkSpacing.inputRadius)
                            .stroke(
                                isFocused ? GymMarkColors.textSecondary : GymMarkColors.cardBorder,
                                lineWidth: 1
                            )
                    )
            )
            .focused($isFocused)
            .overlay(
                Group {
                    if text.isEmpty {
                        Text(placeholder)
                            .font(GymMarkTypography.body)
                            .foregroundColor(GymMarkColors.textTertiary)
                            .padding(.horizontal, GymMarkSpacing.sm + 5)
                            .padding(.vertical, GymMarkSpacing.sm + 8)
                    }
                },
                alignment: .topLeading
            )
    }
}

// MARK: - Search Field
struct SearchField: View {
    @Binding var text: String
    var placeholder: String = "Search..."
    
    @FocusState private var isFocused: Bool
    
    var body: some View {
        HStack(spacing: GymMarkSpacing.iconTextGap) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 16, weight: .light))
                .foregroundColor(GymMarkColors.textSecondary)
            
            TextField("", text: $text, prompt: Text(placeholder).foregroundColor(GymMarkColors.textTertiary))
                .font(GymMarkTypography.body)
                .foregroundColor(GymMarkColors.textPrimary)
                .focused($isFocused)
            
            if !text.isEmpty {
                Button {
                    text = ""
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .font(.system(size: 16))
                        .foregroundColor(GymMarkColors.textTertiary)
                }
            }
        }
        .padding(.horizontal, GymMarkSpacing.md)
        .padding(.vertical, GymMarkSpacing.sm)
        .background(
            RoundedRectangle(cornerRadius: GymMarkSpacing.inputRadius)
                .fill(GymMarkColors.inputBackground)
                .overlay(
                    RoundedRectangle(cornerRadius: GymMarkSpacing.inputRadius)
                        .stroke(
                            isFocused ? GymMarkColors.textSecondary : GymMarkColors.cardBorder,
                            lineWidth: 1
                        )
                )
        )
        .animation(GymMarkAnimation.selection, value: isFocused)
    }
}

// MARK: - Preview
#Preview {
    ScreenContainer {
        ScrollView {
            VStack(spacing: GymMarkSpacing.lg) {
                Text("Input Fields")
                    .font(GymMarkTypography.h2)
                    .foregroundColor(GymMarkColors.textPrimary)
                
                // Standard text field
                GymMarkTextField(
                    placeholder: "Enter your name",
                    text: .constant(""),
                    icon: "person"
                )
                
                // Numeric inputs
                HStack {
                    NumericInputField(value: .constant("135"), unit: "lbs")
                    NumericInputField(value: .constant("12"), unit: "reps")
                }
                
                // Workout set row
                Text("Workout Set Input")
                    .labelStyle()
                    .frame(maxWidth: .infinity, alignment: .leading)
                
                WorkoutSetInputRow(
                    setNumber: 1,
                    weight: .constant("135"),
                    reps: .constant("12"),
                    isPR: true,
                    isCompleted: false
                )
                
                WorkoutSetInputRow(
                    setNumber: 2,
                    weight: .constant("135"),
                    reps: .constant("10"),
                    isCompleted: true
                )
                
                // Text area
                Text("Notes")
                    .labelStyle()
                    .frame(maxWidth: .infinity, alignment: .leading)
                
                GymMarkTextArea(
                    placeholder: "Add notes about your workout...",
                    text: .constant("")
                )
                
                // Search field
                SearchField(text: .constant(""), placeholder: "Search exercises...")
            }
            .padding(GymMarkSpacing.screenHorizontal)
        }
    }
}
