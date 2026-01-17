//
//  GymMarkSpacing.swift
//  GymMark - Scientific Minimalism Design System
//
//  Spacing tokens based on 8px base unit
//

import SwiftUI

// MARK: - GymMark Spacing System
struct GymMarkSpacing {
    
    // MARK: - Base Scale (8px Unit)
    
    /// 4pt - Tight internal padding
    static let xxs: CGFloat = 4
    
    /// 8pt - Icon-to-text gaps
    static let xs: CGFloat = 8
    
    /// 12pt - Related element groups
    static let sm: CGFloat = 12
    
    /// 16pt - Standard padding
    static let md: CGFloat = 16
    
    /// 24pt - Section separators
    static let lg: CGFloat = 24
    
    /// 32pt - Major section gaps
    static let xl: CGFloat = 32
    
    /// 48pt - Screen-level breathing room
    static let xxl: CGFloat = 48
    
    /// 64pt - Hero spacing
    static let xxxl: CGFloat = 64
    
    // MARK: - Layout Constants
    
    /// Screen edge horizontal padding
    static let screenHorizontal: CGFloat = 24
    
    /// Card internal padding
    static let cardPadding: CGFloat = 20
    
    /// Between cards/sections vertical gap
    static let cardGap: CGFloat = 16
    
    /// Icon to text gap
    static let iconTextGap: CGFloat = 12
    
    /// Button height (touch target)
    static let buttonHeight: CGFloat = 56
    
    /// Button content height
    static let buttonContentHeight: CGFloat = 52
    
    /// Button corner radius (pill style)
    static let buttonRadius: CGFloat = 28
    
    /// Card corner radius
    static let cardRadius: CGFloat = 16
    
    /// Input field corner radius
    static let inputRadius: CGFloat = 8
    
    /// Tab bar top padding
    static let tabBarTopPadding: CGFloat = 12
    
    /// Tab bar bottom padding
    static let tabBarBottomPadding: CGFloat = 8
    
    // MARK: - Grid Constants
    
    /// Heatmap cell size
    static let heatmapCellSize: CGFloat = 32
    
    /// Heatmap cell gap
    static let heatmapCellGap: CGFloat = 4
    
    /// Grid line spacing
    static let gridLineSpacing: CGFloat = 80
}

// MARK: - Padding Modifiers
extension View {
    /// Apply standard screen horizontal padding
    func screenPadding() -> some View {
        self.padding(.horizontal, GymMarkSpacing.screenHorizontal)
    }
    
    /// Apply card internal padding
    func cardPadding() -> some View {
        self.padding(GymMarkSpacing.cardPadding)
    }
    
    /// Apply section spacing below
    func sectionSpacing() -> some View {
        self.padding(.bottom, GymMarkSpacing.lg)
    }
}

// MARK: - Preview
#Preview {
    ScrollView {
        VStack(alignment: .leading, spacing: 24) {
            Text("Spacing Scale")
                .font(GymMarkTypography.h2)
                .foregroundColor(GymMarkColors.textPrimary)
            
            Group {
                SpacingRow(name: "xxs (4pt)", value: GymMarkSpacing.xxs)
                SpacingRow(name: "xs (8pt)", value: GymMarkSpacing.xs)
                SpacingRow(name: "sm (12pt)", value: GymMarkSpacing.sm)
                SpacingRow(name: "md (16pt)", value: GymMarkSpacing.md)
                SpacingRow(name: "lg (24pt)", value: GymMarkSpacing.lg)
                SpacingRow(name: "xl (32pt)", value: GymMarkSpacing.xl)
                SpacingRow(name: "xxl (48pt)", value: GymMarkSpacing.xxl)
                SpacingRow(name: "xxxl (64pt)", value: GymMarkSpacing.xxxl)
            }
            
            Divider().background(GymMarkColors.divider)
            
            Text("Layout Constants")
                .font(GymMarkTypography.h3)
                .foregroundColor(GymMarkColors.textPrimary)
            
            Group {
                SpacingRow(name: "Screen Horizontal", value: GymMarkSpacing.screenHorizontal)
                SpacingRow(name: "Card Padding", value: GymMarkSpacing.cardPadding)
                SpacingRow(name: "Button Height", value: GymMarkSpacing.buttonHeight)
            }
        }
        .padding(24)
    }
    .background(GymMarkColors.background)
}

// Helper view for spacing preview
private struct SpacingRow: View {
    let name: String
    let value: CGFloat
    
    var body: some View {
        HStack {
            Text(name)
                .font(GymMarkTypography.body)
                .foregroundColor(GymMarkColors.textSecondary)
            
            Spacer()
            
            Rectangle()
                .fill(GymMarkColors.success)
                .frame(width: value, height: 16)
                .cornerRadius(2)
        }
    }
}
