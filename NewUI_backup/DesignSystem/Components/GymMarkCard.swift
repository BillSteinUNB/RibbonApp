//
//  GymMarkCard.swift
//  GymMark - Scientific Minimalism Design System
//
//  Glassmorphic card component with variants
//

import SwiftUI

// MARK: - Card View Modifier
struct GymMarkCardModifier: ViewModifier {
    var elevated: Bool = false
    var padding: CGFloat = GymMarkSpacing.cardPadding
    
    func body(content: Content) -> some View {
        content
            .padding(padding)
            .background(
                RoundedRectangle(cornerRadius: GymMarkSpacing.cardRadius)
                    .fill(elevated ? GymMarkColors.cardFillElevated : GymMarkColors.cardFill)
                    .overlay(
                        RoundedRectangle(cornerRadius: GymMarkSpacing.cardRadius)
                            .stroke(GymMarkColors.cardBorder, lineWidth: 1)
                    )
            )
    }
}

// MARK: - Card Extension
extension View {
    func gymMarkCard(elevated: Bool = false) -> some View {
        self.modifier(GymMarkCardModifier(elevated: elevated))
    }
    
    func gymMarkCard(elevated: Bool = false, padding: CGFloat) -> some View {
        self.modifier(GymMarkCardModifier(elevated: elevated, padding: padding))
    }
}

// MARK: - Card View Wrapper
struct GymMarkCard<Content: View>: View {
    let content: Content
    var elevated: Bool = false
    
    init(elevated: Bool = false, @ViewBuilder content: () -> Content) {
        self.elevated = elevated
        self.content = content()
    }
    
    var body: some View {
        content
            .gymMarkCard(elevated: elevated)
    }
}

// MARK: - Selectable Card
struct SelectableCard<Content: View>: View {
    let isSelected: Bool
    let action: () -> Void
    let content: Content
    
    init(isSelected: Bool, action: @escaping () -> Void, @ViewBuilder content: () -> Content) {
        self.isSelected = isSelected
        self.action = action
        self.content = content()
    }
    
    var body: some View {
        Button(action: action) {
            content
                .padding(GymMarkSpacing.cardPadding)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(
                    RoundedRectangle(cornerRadius: GymMarkSpacing.cardRadius)
                        .fill(isSelected ? GymMarkColors.selectedBackground : Color.clear)
                        .overlay(
                            RoundedRectangle(cornerRadius: GymMarkSpacing.cardRadius)
                                .stroke(
                                    isSelected ? GymMarkColors.textPrimary : GymMarkColors.cardBorder,
                                    lineWidth: isSelected ? 1.5 : 1
                                )
                        )
                )
        }
        .buttonStyle(.plain)
        .animation(GymMarkAnimation.selection, value: isSelected)
    }
}

// MARK: - List Row Card
struct ListRowCard<Content: View>: View {
    let content: Content
    var showChevron: Bool = true
    let action: () -> Void
    
    init(showChevron: Bool = true, action: @escaping () -> Void, @ViewBuilder content: () -> Content) {
        self.showChevron = showChevron
        self.action = action
        self.content = content()
    }
    
    var body: some View {
        Button(action: action) {
            HStack {
                content
                
                if showChevron {
                    Spacer()
                    Image(systemName: "chevron.right")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(GymMarkColors.textTertiary)
                }
            }
            .padding(GymMarkSpacing.cardPadding)
            .background(
                RoundedRectangle(cornerRadius: GymMarkSpacing.cardRadius)
                    .fill(GymMarkColors.cardFill)
                    .overlay(
                        RoundedRectangle(cornerRadius: GymMarkSpacing.cardRadius)
                            .stroke(GymMarkColors.cardBorder, lineWidth: 1)
                    )
            )
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Preview
#Preview {
    ScreenContainer {
        ScrollView {
            VStack(spacing: GymMarkSpacing.md) {
                Text("Card Styles")
                    .font(GymMarkTypography.h2)
                    .foregroundColor(GymMarkColors.textPrimary)
                
                // Basic Card
                GymMarkCard {
                    VStack(alignment: .leading, spacing: GymMarkSpacing.xs) {
                        Text("Basic Card")
                            .font(GymMarkTypography.h4)
                            .foregroundColor(GymMarkColors.textPrimary)
                        Text("This is a standard glassmorphic card")
                            .font(GymMarkTypography.body)
                            .foregroundColor(GymMarkColors.textSecondary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
                
                // Elevated Card
                GymMarkCard(elevated: true) {
                    VStack(alignment: .leading, spacing: GymMarkSpacing.xs) {
                        Text("Elevated Card")
                            .font(GymMarkTypography.h4)
                            .foregroundColor(GymMarkColors.textPrimary)
                        Text("Higher opacity for emphasis")
                            .font(GymMarkTypography.body)
                            .foregroundColor(GymMarkColors.textSecondary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
                
                // Selectable Cards
                Text("Selectable Cards")
                    .labelStyle()
                    .frame(maxWidth: .infinity, alignment: .leading)
                
                SelectableCard(isSelected: false, action: {}) {
                    HStack {
                        Image(systemName: "circle")
                            .foregroundColor(GymMarkColors.textSecondary)
                        Text("Unselected Option")
                            .font(GymMarkTypography.body)
                            .foregroundColor(GymMarkColors.textPrimary)
                    }
                }
                
                SelectableCard(isSelected: true, action: {}) {
                    HStack {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(GymMarkColors.textPrimary)
                        Text("Selected Option")
                            .font(GymMarkTypography.body)
                            .foregroundColor(GymMarkColors.textPrimary)
                    }
                }
                
                // List Row Card
                Text("List Row Card")
                    .labelStyle()
                    .frame(maxWidth: .infinity, alignment: .leading)
                
                ListRowCard(action: {}) {
                    VStack(alignment: .leading, spacing: GymMarkSpacing.xxs) {
                        Text("Push Day A")
                            .font(GymMarkTypography.bodyLarge)
                            .foregroundColor(GymMarkColors.textPrimary)
                        Text("5 exercises")
                            .font(GymMarkTypography.bodySmall)
                            .foregroundColor(GymMarkColors.textSecondary)
                    }
                }
            }
            .padding(GymMarkSpacing.screenHorizontal)
        }
    }
}
