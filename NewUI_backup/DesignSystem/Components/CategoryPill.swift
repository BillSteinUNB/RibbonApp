//
//  CategoryPill.swift
//  GymMark - Scientific Minimalism Design System
//
//  Filter pills and segmented controls
//

import SwiftUI

// MARK: - Category Pill
struct CategoryPill: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(GymMarkTypography.bodySmall)
                .foregroundColor(isSelected ? GymMarkColors.background : GymMarkColors.textSecondary)
                .padding(.horizontal, GymMarkSpacing.md)
                .padding(.vertical, GymMarkSpacing.xs)
                .background(
                    Capsule()
                        .fill(isSelected ? GymMarkColors.textPrimary : Color.clear)
                        .overlay(
                            Capsule()
                                .stroke(GymMarkColors.cardBorder, lineWidth: 1)
                        )
                )
        }
        .buttonStyle(.plain)
        .animation(GymMarkAnimation.selection, value: isSelected)
    }
}

// MARK: - Category Pill Row (Horizontal Scroll)
struct CategoryPillRow: View {
    let categories: [String]
    @Binding var selectedCategory: String
    
    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: GymMarkSpacing.xs) {
                ForEach(categories, id: \.self) { category in
                    CategoryPill(
                        title: category,
                        isSelected: selectedCategory == category
                    ) {
                        selectedCategory = category
                    }
                }
            }
        }
    }
}

// MARK: - Time Range Selector
struct TimeRangeSelector: View {
    let ranges: [String]
    @Binding var selectedRange: String
    
    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: GymMarkSpacing.xs) {
                ForEach(ranges, id: \.self) { range in
                    Button {
                        selectedRange = range
                    } label: {
                        Text(range)
                            .font(GymMarkTypography.bodySmall)
                            .foregroundColor(selectedRange == range ? GymMarkColors.background : GymMarkColors.textSecondary)
                            .padding(.horizontal, GymMarkSpacing.sm)
                            .padding(.vertical, GymMarkSpacing.xs)
                            .background(
                                RoundedRectangle(cornerRadius: GymMarkSpacing.inputRadius)
                                    .fill(selectedRange == range ? GymMarkColors.textPrimary : Color.clear)
                            )
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .animation(GymMarkAnimation.selection, value: selectedRange)
    }
}

// MARK: - Segmented Control
struct GymMarkSegmentedControl: View {
    let options: [String]
    @Binding var selectedOption: String
    
    var body: some View {
        HStack(spacing: 0) {
            ForEach(options, id: \.self) { option in
                Button {
                    selectedOption = option
                } label: {
                    Text(option)
                        .font(GymMarkTypography.buttonSecondary)
                        .foregroundColor(selectedOption == option ? GymMarkColors.textPrimary : GymMarkColors.textSecondary)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, GymMarkSpacing.sm)
                        .background(
                            selectedOption == option ?
                            RoundedRectangle(cornerRadius: GymMarkSpacing.inputRadius - 2)
                                .fill(GymMarkColors.cardFillElevated) : nil
                        )
                }
                .buttonStyle(.plain)
            }
        }
        .padding(GymMarkSpacing.xxs)
        .background(
            RoundedRectangle(cornerRadius: GymMarkSpacing.inputRadius)
                .fill(GymMarkColors.cardFill)
                .overlay(
                    RoundedRectangle(cornerRadius: GymMarkSpacing.inputRadius)
                        .stroke(GymMarkColors.cardBorder, lineWidth: 1)
                )
        )
        .animation(GymMarkAnimation.selection, value: selectedOption)
    }
}

// MARK: - Rep Range Badge
struct RepRangeBadge: View {
    let range: String
    
    var body: some View {
        Text(range)
            .font(GymMarkTypography.caption)
            .foregroundColor(GymMarkColors.textSecondary)
            .padding(.horizontal, GymMarkSpacing.xs)
            .padding(.vertical, GymMarkSpacing.xxs)
            .background(
                Capsule()
                    .stroke(GymMarkColors.cardBorder, lineWidth: 1)
            )
    }
}

// MARK: - PR Badge
struct PRBadge: View {
    var compact: Bool = false
    
    var body: some View {
        HStack(spacing: compact ? 2 : 4) {
            Image(systemName: "trophy.fill")
                .font(.system(size: compact ? 10 : 12))
            
            if !compact {
                Text("PR")
                    .font(GymMarkTypography.caption)
            }
        }
        .foregroundColor(GymMarkColors.success)
        .padding(.horizontal, compact ? GymMarkSpacing.xxs : GymMarkSpacing.xs)
        .padding(.vertical, GymMarkSpacing.xxs)
        .background(
            Capsule()
                .fill(GymMarkColors.success.opacity(0.15))
        )
    }
}

// MARK: - Preview
#Preview {
    ScreenContainer {
        ScrollView {
            VStack(spacing: GymMarkSpacing.lg) {
                Text("Pills & Segments")
                    .font(GymMarkTypography.h2)
                    .foregroundColor(GymMarkColors.textPrimary)
                
                // Category pills
                Text("Category Pills")
                    .labelStyle()
                    .frame(maxWidth: .infinity, alignment: .leading)
                
                CategoryPillRow(
                    categories: ["All", "Chest", "Back", "Legs", "Shoulders", "Arms"],
                    selectedCategory: .constant("All")
                )
                
                // Time range
                Text("Time Range")
                    .labelStyle()
                    .frame(maxWidth: .infinity, alignment: .leading)
                
                TimeRangeSelector(
                    ranges: ["1W", "1M", "3M", "6M", "1Y", "All"],
                    selectedRange: .constant("1M")
                )
                
                // Segmented control
                Text("Segmented Control")
                    .labelStyle()
                    .frame(maxWidth: .infinity, alignment: .leading)
                
                GymMarkSegmentedControl(
                    options: ["Male", "Female"],
                    selectedOption: .constant("Male")
                )
                
                GymMarkSegmentedControl(
                    options: ["lbs", "kg"],
                    selectedOption: .constant("lbs")
                )
                
                // Badges
                Text("Badges")
                    .labelStyle()
                    .frame(maxWidth: .infinity, alignment: .leading)
                
                HStack(spacing: GymMarkSpacing.md) {
                    RepRangeBadge(range: "8-12")
                    RepRangeBadge(range: "10-15")
                    PRBadge()
                    PRBadge(compact: true)
                }
            }
            .padding(GymMarkSpacing.screenHorizontal)
        }
    }
}
