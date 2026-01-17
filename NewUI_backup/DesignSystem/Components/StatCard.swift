//
//  StatCard.swift
//  GymMark - Scientific Minimalism Design System
//
//  Statistics display cards for metrics
//

import SwiftUI

// MARK: - Stat Card
struct StatCard: View {
    let value: String
    let label: String
    var trend: TrendDirection? = nil
    var trendValue: String? = nil
    var valueColor: Color = GymMarkColors.textPrimary
    
    enum TrendDirection {
        case up, down, neutral
        
        var icon: String {
            switch self {
            case .up: return "arrow.up"
            case .down: return "arrow.down"
            case .neutral: return "arrow.left.arrow.right"
            }
        }
        
        var color: Color {
            switch self {
            case .up: return GymMarkColors.success
            case .down: return GymMarkColors.danger
            case .neutral: return GymMarkColors.textSecondary
            }
        }
    }
    
    var body: some View {
        VStack(spacing: GymMarkSpacing.xs) {
            // Value with optional trend
            HStack(alignment: .lastTextBaseline, spacing: GymMarkSpacing.xxs) {
                Text(value)
                    .font(GymMarkTypography.dataCard)
                    .foregroundColor(valueColor)
                
                if let trend = trend {
                    Image(systemName: trend.icon)
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(trend.color)
                }
            }
            
            // Label
            Text(label)
                .font(GymMarkTypography.label)
                .tracking(0.5)
                .textCase(.uppercase)
                .foregroundColor(GymMarkColors.textSecondary)
            
            // Optional trend value
            if let trendValue = trendValue, let trend = trend {
                Text(trendValue)
                    .font(GymMarkTypography.caption)
                    .foregroundColor(trend.color)
            }
        }
        .frame(maxWidth: .infinity)
        .gymMarkCard()
    }
}

// MARK: - Stat Row (Horizontal layout for 3 stats)
struct StatRow: View {
    let stats: [(value: String, label: String)]
    
    var body: some View {
        HStack(spacing: GymMarkSpacing.sm) {
            ForEach(Array(stats.enumerated()), id: \.offset) { index, stat in
                StatCard(value: stat.value, label: stat.label)
            }
        }
    }
}

// MARK: - Stats Grid (2x2 layout)
struct StatsGrid: View {
    let topLeft: (value: String, label: String, trend: StatCard.TrendDirection?, trendValue: String?)
    let topRight: (value: String, label: String, trend: StatCard.TrendDirection?, trendValue: String?)
    let bottomLeft: (value: String, label: String)
    let bottomRight: (value: String, label: String)
    
    var body: some View {
        VStack(spacing: GymMarkSpacing.sm) {
            HStack(spacing: GymMarkSpacing.sm) {
                StatCard(
                    value: topLeft.value,
                    label: topLeft.label,
                    trend: topLeft.trend,
                    trendValue: topLeft.trendValue
                )
                StatCard(
                    value: topRight.value,
                    label: topRight.label,
                    trend: topRight.trend,
                    trendValue: topRight.trendValue
                )
            }
            
            HStack(spacing: GymMarkSpacing.sm) {
                StatCard(value: bottomLeft.value, label: bottomLeft.label)
                StatCard(value: bottomRight.value, label: bottomRight.label)
            }
        }
    }
}

// MARK: - Compact Stat (Inline)
struct CompactStat: View {
    let value: String
    let label: String
    var icon: String? = nil
    
    var body: some View {
        HStack(spacing: GymMarkSpacing.xs) {
            if let icon = icon {
                Image(systemName: icon)
                    .font(.system(size: 14, weight: .light))
                    .foregroundColor(GymMarkColors.textSecondary)
            }
            
            Text(value)
                .font(GymMarkTypography.dataMini)
                .foregroundColor(GymMarkColors.textPrimary)
            
            Text(label)
                .font(GymMarkTypography.bodySmall)
                .foregroundColor(GymMarkColors.textSecondary)
        }
    }
}

// MARK: - Preview
#Preview {
    ScreenContainer {
        ScrollView {
            VStack(spacing: GymMarkSpacing.lg) {
                Text("Stat Cards")
                    .font(GymMarkTypography.h2)
                    .foregroundColor(GymMarkColors.textPrimary)
                
                // Single stat
                StatCard(value: "175.2", label: "Current Weight")
                
                // Stat with trend
                StatCard(
                    value: "-2.4",
                    label: "Change",
                    trend: .down,
                    trendValue: "lbs this week"
                )
                
                // Stat row (3 across)
                Text("Stats Row")
                    .labelStyle()
                    .frame(maxWidth: .infinity, alignment: .leading)
                
                StatRow(stats: [
                    ("24", "Sessions"),
                    ("52m", "Avg Time"),
                    ("8", "PRs")
                ])
                
                // Stats grid (2x2)
                Text("Stats Grid")
                    .labelStyle()
                    .frame(maxWidth: .infinity, alignment: .leading)
                
                StatsGrid(
                    topLeft: ("175.2", "Current", nil, nil),
                    topRight: ("-2.4", "Change", .down, "lbs"),
                    bottomLeft: ("172.1", "Minimum"),
                    bottomRight: ("178.5", "Maximum")
                )
                
                // Compact stats
                Text("Compact Stats")
                    .labelStyle()
                    .frame(maxWidth: .infinity, alignment: .leading)
                
                HStack(spacing: GymMarkSpacing.md) {
                    CompactStat(value: "52", label: "min", icon: "clock")
                    CompactStat(value: "5", label: "exercises")
                    CompactStat(value: "3", label: "PRs", icon: "trophy.fill")
                }
            }
            .padding(GymMarkSpacing.screenHorizontal)
        }
    }
}
