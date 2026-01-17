//
//  GymMarkColors.swift
//  GymMark - Scientific Minimalism Design System
//
//  Color tokens for the monochromatic design system
//

import SwiftUI

// MARK: - Color Extension for Hex Support
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - GymMark Color System
struct GymMarkColors {
    
    // MARK: - Core Monochromatic
    
    /// Pure black - Primary background
    static let background = Color(hex: "#000000")
    
    /// Subtle lift for elevated cards
    static let backgroundElevated = Color(hex: "#0A0A0A")
    
    /// Card backgrounds and surfaces
    static let surface = Color(hex: "#111111")
    
    // MARK: - Text Hierarchy
    
    /// Headlines, primary data - Pure white
    static let textPrimary = Color(hex: "#FFFFFF")
    
    /// Body text, labels - Light gray
    static let textSecondary = Color(hex: "#A0A0A0")
    
    /// Hints, placeholders - Medium gray
    static let textTertiary = Color(hex: "#666666")
    
    /// Disabled states - Dark gray
    static let textMuted = Color(hex: "#404040")
    
    // MARK: - Functional Accents (Use Sparingly)
    
    /// PRs, achievements, gains - Vibrant green
    static let success = Color(hex: "#00FF88")
    
    /// Caution states - Amber
    static let warning = Color(hex: "#FFB800")
    
    /// Destructive actions, weight loss indicator - Red
    static let danger = Color(hex: "#FF4444")
    
    /// Informational highlights - Blue
    static let info = Color(hex: "#4488FF")
    
    // MARK: - Waveform & Visualization
    
    /// Primary waveform lines
    static let waveformPrimary = Color.white.opacity(0.15)
    
    /// Secondary waveform lines
    static let waveformSecondary = Color.white.opacity(0.08)
    
    /// Background grid lines
    static let gridLines = Color.white.opacity(0.05)
    
    /// Crosshair markers at grid intersections
    static let crosshairMarker = Color.white.opacity(0.12)
    
    // MARK: - Component Colors
    
    /// Card fill - Glassmorphic effect
    static let cardFill = Color.white.opacity(0.05)
    
    /// Elevated card fill
    static let cardFillElevated = Color.white.opacity(0.08)
    
    /// Card border
    static let cardBorder = Color.white.opacity(0.1)
    
    /// Button outline
    static let buttonOutline = Color.white
    
    /// Divider/separator lines
    static let divider = Color.white.opacity(0.1)
    
    /// Selected state background
    static let selectedBackground = Color.white.opacity(0.1)
    
    /// Input field background
    static let inputBackground = Color.white.opacity(0.08)
}

// MARK: - Preview
#Preview {
    ScrollView {
        VStack(alignment: .leading, spacing: 24) {
            // Core Monochromatic
            Text("Core Monochromatic")
                .font(.headline)
                .foregroundColor(.white)
            
            HStack(spacing: 12) {
                ColorSwatch(color: GymMarkColors.background, name: "Background")
                ColorSwatch(color: GymMarkColors.backgroundElevated, name: "Elevated")
                ColorSwatch(color: GymMarkColors.surface, name: "Surface")
            }
            
            // Text Hierarchy
            Text("Text Hierarchy")
                .font(.headline)
                .foregroundColor(.white)
            
            VStack(alignment: .leading, spacing: 8) {
                Text("Primary Text").foregroundColor(GymMarkColors.textPrimary)
                Text("Secondary Text").foregroundColor(GymMarkColors.textSecondary)
                Text("Tertiary Text").foregroundColor(GymMarkColors.textTertiary)
                Text("Muted Text").foregroundColor(GymMarkColors.textMuted)
            }
            
            // Functional Accents
            Text("Functional Accents")
                .font(.headline)
                .foregroundColor(.white)
            
            HStack(spacing: 12) {
                ColorSwatch(color: GymMarkColors.success, name: "Success")
                ColorSwatch(color: GymMarkColors.warning, name: "Warning")
                ColorSwatch(color: GymMarkColors.danger, name: "Danger")
                ColorSwatch(color: GymMarkColors.info, name: "Info")
            }
        }
        .padding(24)
    }
    .background(GymMarkColors.background)
}

// Helper view for color preview
private struct ColorSwatch: View {
    let color: Color
    let name: String
    
    var body: some View {
        VStack(spacing: 4) {
            RoundedRectangle(cornerRadius: 8)
                .fill(color)
                .frame(width: 60, height: 60)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(Color.white.opacity(0.2), lineWidth: 1)
                )
            Text(name)
                .font(.caption2)
                .foregroundColor(.white.opacity(0.6))
        }
    }
}
