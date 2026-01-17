//
//  GymMarkAnimation.swift
//  GymMark - Scientific Minimalism Design System
//
//  Animation tokens for calm, deliberate motion
//

import SwiftUI

// MARK: - GymMark Animation System
struct GymMarkAnimation {
    
    // MARK: - Micro-interactions
    
    /// Button press feedback - 150ms ease out
    static let buttonPress = Animation.easeOut(duration: 0.15)
    
    /// Toggle switch animation - 200ms ease in-out
    static let toggleSwitch = Animation.easeInOut(duration: 0.2)
    
    /// Option selection - 200ms ease out
    static let selection = Animation.easeOut(duration: 0.2)
    
    // MARK: - Screen Transitions
    
    /// Standard screen transition - 350ms ease in-out
    static let screenTransition = Animation.easeInOut(duration: 0.35)
    
    /// Card entrance animation - 400ms ease out
    static let cardEntrance = Animation.easeOut(duration: 0.4)
    
    /// Modal presentation - 300ms ease out
    static let modalPresent = Animation.easeOut(duration: 0.3)
    
    /// Fade transition - 200ms
    static let fade = Animation.easeInOut(duration: 0.2)
    
    // MARK: - Data Visualization
    
    /// Chart line drawing animation - 800ms ease out
    static let chartDraw = Animation.easeOut(duration: 0.8)
    
    /// Number counting animation - 600ms ease out
    static let numberCount = Animation.easeOut(duration: 0.6)
    
    /// Progress bar fill - 500ms ease out
    static let progressFill = Animation.easeOut(duration: 0.5)
    
    // MARK: - Ambient
    
    /// Waveform continuous cycle - 25 seconds linear, forever
    static let waveformCycle = Animation.linear(duration: 25).repeatForever(autoreverses: false)
    
    /// Subtle pulse glow - 2 seconds ease in-out, forever
    static let pulseGlow = Animation.easeInOut(duration: 2).repeatForever(autoreverses: true)
    
    /// Breathing animation - 4 seconds ease in-out, forever
    static let breathing = Animation.easeInOut(duration: 4).repeatForever(autoreverses: true)
    
    // MARK: - Staggered Entrance
    
    /// Calculate stagger delay for list items
    /// - Parameter index: Item index in the list
    /// - Returns: Delay duration based on index
    static func staggerDelay(for index: Int) -> Double {
        Double(index) * 0.08
    }
    
    /// Staggered entrance animation for list items
    static let staggeredEntrance = Animation.easeOut(duration: 0.4)
}

// MARK: - Animation View Modifiers
extension View {
    /// Apply staggered entrance animation
    func staggeredEntrance(index: Int, appeared: Bool) -> some View {
        self
            .opacity(appeared ? 1 : 0)
            .offset(y: appeared ? 0 : 20)
            .animation(
                GymMarkAnimation.staggeredEntrance.delay(GymMarkAnimation.staggerDelay(for: index)),
                value: appeared
            )
    }
    
    /// Apply card entrance animation
    func cardEntranceAnimation(appeared: Bool) -> some View {
        self
            .opacity(appeared ? 1 : 0)
            .offset(y: appeared ? 0 : 16)
            .animation(GymMarkAnimation.cardEntrance, value: appeared)
    }
    
    /// Apply fade animation
    func fadeAnimation(visible: Bool) -> some View {
        self
            .opacity(visible ? 1 : 0)
            .animation(GymMarkAnimation.fade, value: visible)
    }
    
    /// Apply pulse glow effect
    func pulseGlow() -> some View {
        self.modifier(PulseGlowModifier())
    }
}

// MARK: - Pulse Glow Modifier
struct PulseGlowModifier: ViewModifier {
    @State private var isPulsing = false
    
    func body(content: Content) -> some View {
        content
            .shadow(
                color: GymMarkColors.textPrimary.opacity(isPulsing ? 0.3 : 0.1),
                radius: isPulsing ? 8 : 4
            )
            .onAppear {
                withAnimation(GymMarkAnimation.pulseGlow) {
                    isPulsing = true
                }
            }
    }
}

// MARK: - Preview
#Preview {
    VStack(spacing: 32) {
        Text("Animation Tokens")
            .font(GymMarkTypography.h2)
            .foregroundColor(GymMarkColors.textPrimary)
        
        // Demo button with press animation
        Button(action: {}) {
            Text("Press Me")
                .font(GymMarkTypography.buttonPrimary)
                .foregroundColor(GymMarkColors.textPrimary)
                .frame(maxWidth: .infinity)
                .frame(height: GymMarkSpacing.buttonHeight)
                .background(
                    RoundedRectangle(cornerRadius: GymMarkSpacing.buttonRadius)
                        .stroke(GymMarkColors.buttonOutline, lineWidth: 1.5)
                )
        }
        .buttonStyle(ScaleButtonStyle())
        
        // Demo card with pulse glow
        Text("Pulse Glow Effect")
            .font(GymMarkTypography.body)
            .foregroundColor(GymMarkColors.textPrimary)
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(GymMarkColors.cardFill)
            )
            .pulseGlow()
    }
    .padding(24)
    .background(GymMarkColors.background)
}

// Helper button style for preview
private struct ScaleButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
            .animation(GymMarkAnimation.buttonPress, value: configuration.isPressed)
    }
}
