//
//  OptionCard.swift
//  GymMark - Scientific Minimalism Design System
//
//  Selectable option cards for questionnaires and settings
//

import SwiftUI

// MARK: - Option Card (Single Selection)
struct OptionCard: View {
    let title: String
    var subtitle: String? = nil
    var icon: String? = nil
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: GymMarkSpacing.iconTextGap) {
                // Selection indicator
                ZStack {
                    Circle()
                        .stroke(isSelected ? GymMarkColors.textPrimary : GymMarkColors.textTertiary, lineWidth: 1.5)
                        .frame(width: 24, height: 24)
                    
                    if isSelected {
                        Circle()
                            .fill(GymMarkColors.textPrimary)
                            .frame(width: 12, height: 12)
                    }
                }
                
                // Icon (optional)
                if let icon = icon {
                    Image(systemName: icon)
                        .font(.system(size: 18, weight: .light))
                        .foregroundColor(GymMarkColors.textPrimary)
                        .frame(width: 24)
                }
                
                // Text content
                VStack(alignment: .leading, spacing: GymMarkSpacing.xxs) {
                    Text(title)
                        .font(GymMarkTypography.bodyLarge)
                        .foregroundColor(GymMarkColors.textPrimary)
                    
                    if let subtitle = subtitle {
                        Text(subtitle)
                            .font(GymMarkTypography.bodySmall)
                            .foregroundColor(GymMarkColors.textSecondary)
                    }
                }
                
                Spacer()
                
                // Checkmark when selected
                if isSelected {
                    Image(systemName: "checkmark")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(GymMarkColors.textPrimary)
                }
            }
            .padding(GymMarkSpacing.cardPadding)
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

// MARK: - Goal Card (with direction icon)
struct GoalCard: View {
    let title: String
    let subtitle: String
    let direction: GoalDirection
    let isSelected: Bool
    let action: () -> Void
    
    enum GoalDirection {
        case up, down, maintain
        
        var icon: String {
            switch self {
            case .up: return "arrow.up"
            case .down: return "arrow.down"
            case .maintain: return "equal"
            }
        }
    }
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: GymMarkSpacing.md) {
                // Direction icon
                Image(systemName: direction.icon)
                    .font(.system(size: 24, weight: .light))
                    .foregroundColor(GymMarkColors.textPrimary)
                    .frame(width: 40, height: 40)
                    .background(
                        Circle()
                            .stroke(GymMarkColors.textSecondary.opacity(0.3), lineWidth: 1)
                    )
                
                // Text content
                VStack(alignment: .leading, spacing: GymMarkSpacing.xxs) {
                    Text(title)
                        .font(GymMarkTypography.bodyLarge)
                        .foregroundColor(GymMarkColors.textPrimary)
                    
                    Text(subtitle)
                        .font(GymMarkTypography.bodySmall)
                        .foregroundColor(GymMarkColors.textSecondary)
                }
                
                Spacer()
                
                // Selection indicator
                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 24))
                        .foregroundColor(GymMarkColors.textPrimary)
                }
            }
            .padding(GymMarkSpacing.cardPadding)
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

// MARK: - Timeframe Pill
struct TimeframePill: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: GymMarkSpacing.xs) {
                Circle()
                    .fill(isSelected ? GymMarkColors.textPrimary : Color.clear)
                    .overlay(
                        Circle()
                            .stroke(GymMarkColors.textSecondary, lineWidth: 1)
                    )
                    .frame(width: 16, height: 16)
                
                Text(title)
                    .font(GymMarkTypography.body)
                    .foregroundColor(isSelected ? GymMarkColors.textPrimary : GymMarkColors.textSecondary)
                
                if isSelected {
                    Image(systemName: "checkmark")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(GymMarkColors.success)
                }
            }
            .padding(.horizontal, GymMarkSpacing.md)
            .padding(.vertical, GymMarkSpacing.sm)
            .background(
                RoundedRectangle(cornerRadius: GymMarkSpacing.inputRadius)
                    .fill(isSelected ? GymMarkColors.selectedBackground : Color.clear)
            )
        }
        .buttonStyle(.plain)
        .animation(GymMarkAnimation.selection, value: isSelected)
    }
}

// MARK: - Preview
#Preview {
    ScreenContainer {
        ScrollView {
            VStack(spacing: GymMarkSpacing.lg) {
                Text("Option Cards")
                    .font(GymMarkTypography.h2)
                    .foregroundColor(GymMarkColors.textPrimary)
                
                // Standard options
                OptionCard(
                    title: "Beginner",
                    subtitle: "Less than 6 months",
                    isSelected: false,
                    action: {}
                )
                
                OptionCard(
                    title: "Intermediate",
                    subtitle: "6 months - 2 years",
                    isSelected: true,
                    action: {}
                )
                
                OptionCard(
                    title: "Advanced",
                    subtitle: "2+ years",
                    isSelected: false,
                    action: {}
                )
                
                GymMarkDivider()
                
                // Goal cards
                Text("Goal Cards")
                    .labelStyle()
                    .frame(maxWidth: .infinity, alignment: .leading)
                
                GoalCard(
                    title: "Lose Weight",
                    subtitle: "Caloric deficit",
                    direction: .down,
                    isSelected: false,
                    action: {}
                )
                
                GoalCard(
                    title: "Gain Weight",
                    subtitle: "Caloric surplus",
                    direction: .up,
                    isSelected: true,
                    action: {}
                )
                
                GoalCard(
                    title: "Maintain",
                    subtitle: "Stay consistent",
                    direction: .maintain,
                    isSelected: false,
                    action: {}
                )
                
                GymMarkDivider()
                
                // Timeframe pills
                Text("Timeframe Pills")
                    .labelStyle()
                    .frame(maxWidth: .infinity, alignment: .leading)
                
                VStack(spacing: GymMarkSpacing.xs) {
                    TimeframePill(title: "1 Week", isSelected: false, action: {})
                    TimeframePill(title: "1 Month", isSelected: false, action: {})
                    TimeframePill(title: "3 Months", isSelected: true, action: {})
                    TimeframePill(title: "1 Year", isSelected: false, action: {})
                }
            }
            .padding(GymMarkSpacing.screenHorizontal)
        }
    }
}
