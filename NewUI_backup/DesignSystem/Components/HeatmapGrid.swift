//
//  HeatmapGrid.swift
//  GymMark - Scientific Minimalism Design System
//
//  Activity heatmap visualization for workout tracking
//

import SwiftUI

// MARK: - Heatmap Grid
struct HeatmapGrid: View {
    let data: [Date: Bool] // Date -> worked out
    var period: HeatmapPeriod = .week
    @State private var appeared = false
    
    enum HeatmapPeriod: String, CaseIterable {
        case week = "Week"
        case month = "Month"
        case year = "Year"
        
        var columns: Int {
            switch self {
            case .week: return 7
            case .month: return 7
            case .year: return 52
            }
        }
        
        var rows: Int {
            switch self {
            case .week: return 1
            case .month: return 5
            case .year: return 7
            }
        }
    }
    
    private let dayLabels = ["M", "T", "W", "T", "F", "S", "S"]
    
    var body: some View {
        VStack(spacing: GymMarkSpacing.sm) {
            // Day labels for week view
            if period == .week {
                HStack(spacing: GymMarkSpacing.heatmapCellGap) {
                    ForEach(dayLabels, id: \.self) { day in
                        Text(day)
                            .font(GymMarkTypography.caption)
                            .foregroundColor(GymMarkColors.textTertiary)
                            .frame(width: GymMarkSpacing.heatmapCellSize)
                    }
                }
            }
            
            // Grid
            LazyVGrid(
                columns: Array(repeating: GridItem(.fixed(GymMarkSpacing.heatmapCellSize), spacing: GymMarkSpacing.heatmapCellGap), count: period.columns),
                spacing: GymMarkSpacing.heatmapCellGap
            ) {
                ForEach(0..<(period.columns * period.rows), id: \.self) { index in
                    HeatmapCell(
                        isActive: Bool.random(), // Replace with actual data lookup
                        isToday: index == period.columns - 1 && period == .week
                    )
                    .opacity(appeared ? 1 : 0)
                    .animation(
                        .easeOut(duration: 0.3).delay(Double(index) * 0.02),
                        value: appeared
                    )
                }
            }
            
            // Legend
            HStack(spacing: GymMarkSpacing.md) {
                LegendItem(color: GymMarkColors.cardBorder, label: "Rest")
                LegendItem(color: GymMarkColors.textPrimary.opacity(0.8), label: "Workout")
            }
            .padding(.top, GymMarkSpacing.xs)
        }
        .onAppear {
            withAnimation {
                appeared = true
            }
        }
    }
}

// MARK: - Heatmap Cell
struct HeatmapCell: View {
    let isActive: Bool
    var isToday: Bool = false
    
    var body: some View {
        RoundedRectangle(cornerRadius: 4)
            .fill(isActive ? GymMarkColors.textPrimary.opacity(0.8) : Color.clear)
            .overlay(
                RoundedRectangle(cornerRadius: 4)
                    .stroke(
                        isToday ? GymMarkColors.success : GymMarkColors.cardBorder,
                        lineWidth: isToday ? 2 : 1
                    )
            )
            .frame(width: GymMarkSpacing.heatmapCellSize, height: GymMarkSpacing.heatmapCellSize)
            .modifier(isToday ? PulseGlowModifier() : nil)
    }
}

// Optional modifier helper
extension View {
    @ViewBuilder
    func modifier<T: ViewModifier>(_ modifier: T?) -> some View {
        if let modifier = modifier {
            self.modifier(modifier)
        } else {
            self
        }
    }
}

// MARK: - Legend Item
private struct LegendItem: View {
    let color: Color
    let label: String
    
    var body: some View {
        HStack(spacing: GymMarkSpacing.xxs) {
            RoundedRectangle(cornerRadius: 2)
                .fill(color == GymMarkColors.cardBorder ? Color.clear : color)
                .overlay(
                    RoundedRectangle(cornerRadius: 2)
                        .stroke(GymMarkColors.cardBorder, lineWidth: 1)
                )
                .frame(width: 12, height: 12)
            
            Text(label)
                .font(GymMarkTypography.caption)
                .foregroundColor(GymMarkColors.textTertiary)
        }
    }
}

// MARK: - Activity Card with Heatmap
struct ActivityCard: View {
    @Binding var selectedPeriod: HeatmapGrid.HeatmapPeriod
    let data: [Date: Bool]
    
    var body: some View {
        VStack(spacing: GymMarkSpacing.md) {
            // Header with period selector
            HStack {
                Text("Activity")
                    .labelStyle()
                
                Spacer()
                
                Menu {
                    ForEach(HeatmapGrid.HeatmapPeriod.allCases, id: \.self) { period in
                        Button(period.rawValue) {
                            selectedPeriod = period
                        }
                    }
                } label: {
                    HStack(spacing: GymMarkSpacing.xxs) {
                        Text(selectedPeriod.rawValue)
                            .font(GymMarkTypography.bodySmall)
                            .foregroundColor(GymMarkColors.textSecondary)
                        
                        Image(systemName: "chevron.down")
                            .font(.system(size: 10, weight: .medium))
                            .foregroundColor(GymMarkColors.textTertiary)
                    }
                }
            }
            
            HeatmapGrid(data: data, period: selectedPeriod)
        }
        .gymMarkCard()
    }
}

// MARK: - Preview
#Preview {
    ScreenContainer {
        ScrollView {
            VStack(spacing: GymMarkSpacing.lg) {
                Text("Heatmap Grids")
                    .font(GymMarkTypography.h2)
                    .foregroundColor(GymMarkColors.textPrimary)
                
                // Week view
                Text("Week View")
                    .labelStyle()
                    .frame(maxWidth: .infinity, alignment: .leading)
                
                HeatmapGrid(data: [:], period: .week)
                    .gymMarkCard()
                
                // Activity card with selector
                Text("Activity Card")
                    .labelStyle()
                    .frame(maxWidth: .infinity, alignment: .leading)
                
                ActivityCard(selectedPeriod: .constant(.week), data: [:])
            }
            .padding(GymMarkSpacing.screenHorizontal)
        }
    }
}
