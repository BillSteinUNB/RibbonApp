//
//  GymMarkTypography.swift
//  GymMark - Scientific Minimalism Design System
//
//  Typography tokens with SF Pro and SF Mono fonts
//

import SwiftUI

// MARK: - GymMark Typography System
struct GymMarkTypography {
    
    // MARK: - Display (App Title, Major Features)
    
    /// 56pt bold with tight tracking - App branding
    static let displayLarge: Font = .system(size: 56, weight: .bold, design: .default)
    
    /// 48pt bold - Large feature headers
    static let displayMedium: Font = .system(size: 48, weight: .bold, design: .default)
    
    // MARK: - Headlines
    
    /// 40pt bold with tight tracking - Major screen headers
    static let h1: Font = .system(size: 40, weight: .bold, design: .default)
    
    /// 32pt semibold - Section headers
    static let h2: Font = .system(size: 32, weight: .semibold, design: .default)
    
    /// 24pt semibold - Subsection headers
    static let h3: Font = .system(size: 24, weight: .semibold, design: .default)
    
    /// 20pt medium - Card titles
    static let h4: Font = .system(size: 20, weight: .medium, design: .default)
    
    // MARK: - Body Text
    
    /// 17pt regular - Large body copy
    static let bodyLarge: Font = .system(size: 17, weight: .regular, design: .default)
    
    /// 15pt regular - Standard body text
    static let body: Font = .system(size: 15, weight: .regular, design: .default)
    
    /// 13pt regular - Small body text
    static let bodySmall: Font = .system(size: 13, weight: .regular, design: .default)
    
    // MARK: - Labels & Captions
    
    /// 12pt medium uppercase with letter-spacing - Section labels
    static let label: Font = .system(size: 12, weight: .medium, design: .default)
    
    /// 11pt regular - Small captions
    static let caption: Font = .system(size: 11, weight: .regular, design: .default)
    
    /// 10pt medium - Tab labels
    static let tabLabel: Font = .system(size: 10, weight: .medium, design: .default)
    
    // MARK: - Monospaced Data
    
    /// 48pt light monospaced - Large timer/data displays
    static let dataLarge: Font = .system(size: 48, weight: .light, design: .monospaced)
    
    /// 32pt regular monospaced - Medium data displays
    static let dataMedium: Font = .system(size: 32, weight: .regular, design: .monospaced)
    
    /// 24pt regular monospaced - Card statistics
    static let dataCard: Font = .system(size: 24, weight: .regular, design: .monospaced)
    
    /// 20pt medium monospaced - Input fields
    static let dataSmall: Font = .system(size: 20, weight: .medium, design: .monospaced)
    
    /// 14pt regular monospaced - Small data labels
    static let dataMini: Font = .system(size: 14, weight: .regular, design: .monospaced)
    
    // MARK: - Button Text
    
    /// 17pt semibold - Primary buttons
    static let buttonPrimary: Font = .system(size: 17, weight: .semibold, design: .default)
    
    /// 15pt medium - Secondary buttons
    static let buttonSecondary: Font = .system(size: 15, weight: .medium, design: .default)
}

// MARK: - Text Style Modifiers
extension View {
    /// Apply display large style with tight tracking
    func displayLargeStyle() -> some View {
        self
            .font(GymMarkTypography.displayLarge)
            .tracking(-2)
            .foregroundColor(GymMarkColors.textPrimary)
    }
    
    /// Apply H1 style with tight tracking
    func h1Style() -> some View {
        self
            .font(GymMarkTypography.h1)
            .tracking(-1.5)
            .foregroundColor(GymMarkColors.textPrimary)
    }
    
    /// Apply H2 style with tight tracking
    func h2Style() -> some View {
        self
            .font(GymMarkTypography.h2)
            .tracking(-1)
            .foregroundColor(GymMarkColors.textPrimary)
    }
    
    /// Apply H3 style with slight tracking
    func h3Style() -> some View {
        self
            .font(GymMarkTypography.h3)
            .tracking(-0.5)
            .foregroundColor(GymMarkColors.textPrimary)
    }
    
    /// Apply uppercase label style with letter-spacing
    func labelStyle() -> some View {
        self
            .font(GymMarkTypography.label)
            .tracking(0.5)
            .textCase(.uppercase)
            .foregroundColor(GymMarkColors.textSecondary)
    }
    
    /// Apply body style
    func bodyStyle() -> some View {
        self
            .font(GymMarkTypography.body)
            .foregroundColor(GymMarkColors.textSecondary)
            .lineSpacing(4)
    }
    
    /// Apply large data display style
    func dataLargeStyle() -> some View {
        self
            .font(GymMarkTypography.dataLarge)
            .foregroundColor(GymMarkColors.textPrimary)
    }
}

// MARK: - Preview
#Preview {
    ScrollView {
        VStack(alignment: .leading, spacing: 32) {
            // Display & Headlines
            Group {
                Text("Typography")
                    .displayLargeStyle()
                
                Text("Headline 1")
                    .h1Style()
                
                Text("Headline 2")
                    .h2Style()
                
                Text("Headline 3")
                    .h3Style()
                
                Text("Headline 4")
                    .font(GymMarkTypography.h4)
                    .foregroundColor(GymMarkColors.textPrimary)
            }
            
            Divider().background(GymMarkColors.divider)
            
            // Body Text
            Group {
                Text("Body Large - The quick brown fox jumps over the lazy dog.")
                    .font(GymMarkTypography.bodyLarge)
                    .foregroundColor(GymMarkColors.textPrimary)
                
                Text("Body - The quick brown fox jumps over the lazy dog.")
                    .bodyStyle()
                
                Text("Body Small - The quick brown fox jumps over the lazy dog.")
                    .font(GymMarkTypography.bodySmall)
                    .foregroundColor(GymMarkColors.textSecondary)
            }
            
            Divider().background(GymMarkColors.divider)
            
            // Labels & Captions
            Group {
                Text("Section Label")
                    .labelStyle()
                
                Text("Caption text for additional context")
                    .font(GymMarkTypography.caption)
                    .foregroundColor(GymMarkColors.textTertiary)
            }
            
            Divider().background(GymMarkColors.divider)
            
            // Monospaced Data
            Group {
                Text("00:32:45")
                    .dataLargeStyle()
                
                Text("175.2")
                    .font(GymMarkTypography.dataMedium)
                    .foregroundColor(GymMarkColors.textPrimary)
                
                Text("2,450")
                    .font(GymMarkTypography.dataCard)
                    .foregroundColor(GymMarkColors.textPrimary)
                
                Text("135")
                    .font(GymMarkTypography.dataSmall)
                    .foregroundColor(GymMarkColors.textPrimary)
            }
        }
        .padding(24)
    }
    .background(GymMarkColors.background)
}
