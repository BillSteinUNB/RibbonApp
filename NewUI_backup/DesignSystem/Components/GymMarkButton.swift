//
//  GymMarkButton.swift
//  GymMark - Scientific Minimalism Design System
//
//  Button styles: Primary (outline), Secondary (text), Filled (inverted)
//

import SwiftUI

// MARK: - Primary CTA Button (Ghost/Outline)
struct PrimaryCTAButtonStyle: ButtonStyle {
    var disabled: Bool = false
    
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(GymMarkTypography.buttonPrimary)
            .foregroundColor(disabled ? GymMarkColors.textMuted : GymMarkColors.textPrimary)
            .frame(maxWidth: .infinity)
            .frame(height: GymMarkSpacing.buttonHeight)
            .background(
                RoundedRectangle(cornerRadius: GymMarkSpacing.buttonRadius)
                    .stroke(
                        disabled ? GymMarkColors.textMuted : GymMarkColors.buttonOutline,
                        lineWidth: 1.5
                    )
            )
            .opacity(configuration.isPressed ? 0.7 : 1.0)
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
            .animation(GymMarkAnimation.buttonPress, value: configuration.isPressed)
    }
}

// MARK: - Secondary CTA Button (Text Only)
struct SecondaryCTAButtonStyle: ButtonStyle {
    var disabled: Bool = false
    
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(GymMarkTypography.buttonSecondary)
            .foregroundColor(disabled ? GymMarkColors.textMuted : GymMarkColors.textSecondary)
            .opacity(configuration.isPressed ? 0.4 : 1.0)
            .animation(GymMarkAnimation.buttonPress, value: configuration.isPressed)
    }
}

// MARK: - Filled CTA Button (White fill, black text)
struct FilledCTAButtonStyle: ButtonStyle {
    var disabled: Bool = false
    
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(GymMarkTypography.buttonPrimary)
            .foregroundColor(disabled ? GymMarkColors.textMuted : GymMarkColors.background)
            .frame(maxWidth: .infinity)
            .frame(height: GymMarkSpacing.buttonHeight)
            .background(
                RoundedRectangle(cornerRadius: GymMarkSpacing.buttonRadius)
                    .fill(disabled ? GymMarkColors.textMuted : GymMarkColors.textPrimary)
            )
            .opacity(configuration.isPressed ? 0.8 : 1.0)
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
            .animation(GymMarkAnimation.buttonPress, value: configuration.isPressed)
    }
}

// MARK: - Ghost Button (Smaller, outline)
struct GhostButtonStyle: ButtonStyle {
    var disabled: Bool = false
    
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(GymMarkTypography.buttonSecondary)
            .foregroundColor(disabled ? GymMarkColors.textMuted : GymMarkColors.textPrimary)
            .padding(.horizontal, GymMarkSpacing.md)
            .padding(.vertical, GymMarkSpacing.sm)
            .background(
                RoundedRectangle(cornerRadius: GymMarkSpacing.inputRadius)
                    .stroke(
                        disabled ? GymMarkColors.textMuted : GymMarkColors.textSecondary,
                        lineWidth: 1
                    )
            )
            .opacity(configuration.isPressed ? 0.6 : 1.0)
            .animation(GymMarkAnimation.buttonPress, value: configuration.isPressed)
    }
}

// MARK: - Icon Button (Circular)
struct IconButtonStyle: ButtonStyle {
    var size: CGFloat = 44
    
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .frame(width: size, height: size)
            .background(
                Circle()
                    .fill(GymMarkColors.cardFill)
                    .overlay(
                        Circle()
                            .stroke(GymMarkColors.cardBorder, lineWidth: 1)
                    )
            )
            .opacity(configuration.isPressed ? 0.6 : 1.0)
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
            .animation(GymMarkAnimation.buttonPress, value: configuration.isPressed)
    }
}

// MARK: - Danger Button (Red outline)
struct DangerButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(GymMarkTypography.buttonSecondary)
            .foregroundColor(GymMarkColors.danger)
            .frame(maxWidth: .infinity)
            .frame(height: GymMarkSpacing.buttonHeight)
            .background(
                RoundedRectangle(cornerRadius: GymMarkSpacing.buttonRadius)
                    .stroke(GymMarkColors.danger.opacity(0.5), lineWidth: 1)
            )
            .opacity(configuration.isPressed ? 0.6 : 1.0)
            .animation(GymMarkAnimation.buttonPress, value: configuration.isPressed)
    }
}

// MARK: - Button View Wrappers for Convenience

struct PrimaryButton: View {
    let title: String
    let action: () -> Void
    var disabled: Bool = false
    var showArrow: Bool = false
    
    var body: some View {
        Button(action: action) {
            HStack {
                Text(title)
                if showArrow {
                    Spacer()
                    Image(systemName: "arrow.right")
                        .font(.system(size: 16, weight: .medium))
                }
            }
            .padding(.horizontal, showArrow ? GymMarkSpacing.lg : 0)
        }
        .buttonStyle(PrimaryCTAButtonStyle(disabled: disabled))
        .disabled(disabled)
    }
}

struct SecondaryButton: View {
    let title: String
    let action: () -> Void
    var disabled: Bool = false
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .frame(maxWidth: .infinity)
                .frame(height: GymMarkSpacing.buttonHeight)
        }
        .buttonStyle(SecondaryCTAButtonStyle(disabled: disabled))
        .disabled(disabled)
    }
}

struct FilledButton: View {
    let title: String
    let action: () -> Void
    var disabled: Bool = false
    
    var body: some View {
        Button(action: action) {
            Text(title)
        }
        .buttonStyle(FilledCTAButtonStyle(disabled: disabled))
        .disabled(disabled)
    }
}

// MARK: - Preview
#Preview {
    ScreenContainer {
        VStack(spacing: GymMarkSpacing.lg) {
            Text("Button Styles")
                .font(GymMarkTypography.h2)
                .foregroundColor(GymMarkColors.textPrimary)
            
            // Primary (Outline)
            PrimaryButton(title: "Get Started", action: {})
            
            // Primary with Arrow
            PrimaryButton(title: "Start Workout", action: {}, showArrow: true)
            
            // Secondary (Text)
            SecondaryButton(title: "Skip", action: {})
            
            // Filled
            FilledButton(title: "Save Changes", action: {})
            
            // Disabled states
            PrimaryButton(title: "Disabled", action: {}, disabled: true)
            FilledButton(title: "Disabled Filled", action: {}, disabled: true)
            
            // Ghost
            Button("Ghost Button") {}
                .buttonStyle(GhostButtonStyle())
            
            // Danger
            Button("Delete Account") {}
                .buttonStyle(DangerButtonStyle())
            
            // Icon Button
            HStack(spacing: GymMarkSpacing.md) {
                Button {} label: {
                    Image(systemName: "plus")
                        .font(.system(size: 18, weight: .light))
                        .foregroundColor(GymMarkColors.textPrimary)
                }
                .buttonStyle(IconButtonStyle())
                
                Button {} label: {
                    Image(systemName: "xmark")
                        .font(.system(size: 18, weight: .light))
                        .foregroundColor(GymMarkColors.textPrimary)
                }
                .buttonStyle(IconButtonStyle())
            }
        }
        .padding(GymMarkSpacing.screenHorizontal)
    }
}
