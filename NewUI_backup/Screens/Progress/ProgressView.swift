//
//  ProgressView.swift
//  GymMark - Scientific Minimalism Design System
//
//  Weight trends, calorie tracking, and body composition charts
//

import SwiftUI
import Charts

struct ProgressView: View {
    @State private var appeared = false
    @State private var selectedRange: String = "1M"
    
    private let timeRanges = ["1W", "1M", "3M", "6M", "1Y", "All"]
    
    var body: some View {
        ScreenContainer {
            ScrollView(showsIndicators: false) {
                VStack(spacing: GymMarkSpacing.lg) {
                    // Header
                    headerSection
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.5), value: appeared)
                    
                    // Time Range Selector
                    TimeRangeSelector(ranges: timeRanges, selectedRange: $selectedRange)
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.5).delay(0.1), value: appeared)
                    
                    // Stats Grid
                    statsGridSection
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.5).delay(0.2), value: appeared)
                    
                    // Weight Chart
                    weightChartSection
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.5).delay(0.3), value: appeared)
                    
                    // Calorie Chart
                    calorieChartSection
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.5).delay(0.4), value: appeared)
                    
                    // Bottom padding for tab bar
                    Spacer().frame(height: GymMarkSpacing.xxl)
                }
                .padding(.horizontal, GymMarkSpacing.screenHorizontal)
                .padding(.top, GymMarkSpacing.lg)
            }
        }
        .onAppear {
            appeared = true
        }
    }
    
    // MARK: - Header Section
    private var headerSection: some View {
        Text("Progress")
            .font(GymMarkTypography.h2)
            .tracking(-1)
            .foregroundColor(GymMarkColors.textPrimary)
            .frame(maxWidth: .infinity, alignment: .leading)
    }
    
    // MARK: - Stats Grid
    private var statsGridSection: some View {
        StatsGrid(
            topLeft: ("175.2", "Current", nil, "lbs"),
            topRight: ("-2.4", "Change", .down, "lbs"),
            bottomLeft: ("172.1", "Minimum"),
            bottomRight: ("178.5", "Maximum")
        )
    }
    
    // MARK: - Weight Chart Section
    private var weightChartSection: some View {
        VStack(alignment: .leading, spacing: GymMarkSpacing.md) {
            Text("Weight Trend")
                .labelStyle()
            
            WeightChartView(data: WeightEntry.sampleData)
                .frame(height: 200)
        }
        .gymMarkCard()
    }
    
    // MARK: - Calorie Chart Section
    private var calorieChartSection: some View {
        VStack(alignment: .leading, spacing: GymMarkSpacing.md) {
            Text("Daily Calories")
                .labelStyle()
            
            CalorieChartView(data: CalorieEntry.sampleData, tdee: 2450)
                .frame(height: 200)
        }
        .gymMarkCard()
    }
}

// MARK: - Weight Chart
struct WeightChartView: View {
    let data: [WeightEntry]
    
    var body: some View {
        Chart {
            ForEach(data) { entry in
                LineMark(
                    x: .value("Date", entry.date),
                    y: .value("Weight", entry.weight)
                )
                .foregroundStyle(GymMarkColors.textPrimary.opacity(0.8))
                .lineStyle(StrokeStyle(lineWidth: 2))
                
                PointMark(
                    x: .value("Date", entry.date),
                    y: .value("Weight", entry.weight)
                )
                .foregroundStyle(GymMarkColors.textPrimary)
                .symbolSize(30)
            }
        }
        .chartXAxis {
            AxisMarks(values: .stride(by: .day, count: 7)) { value in
                AxisGridLine(stroke: StrokeStyle(lineWidth: 0.5))
                    .foregroundStyle(GymMarkColors.gridLines)
                AxisValueLabel()
                    .foregroundStyle(GymMarkColors.textTertiary)
                    .font(GymMarkTypography.caption)
            }
        }
        .chartYAxis {
            AxisMarks { value in
                AxisGridLine(stroke: StrokeStyle(lineWidth: 0.5))
                    .foregroundStyle(GymMarkColors.gridLines)
                AxisValueLabel()
                    .foregroundStyle(GymMarkColors.textTertiary)
                    .font(GymMarkTypography.caption)
            }
        }
    }
}

// MARK: - Calorie Chart
struct CalorieChartView: View {
    let data: [CalorieEntry]
    let tdee: Double
    
    var body: some View {
        Chart {
            // Calorie bars
            ForEach(data) { entry in
                BarMark(
                    x: .value("Day", entry.day),
                    y: .value("Calories", entry.calories)
                )
                .foregroundStyle(GymMarkColors.textPrimary.opacity(0.7))
                .cornerRadius(4)
            }
            
            // TDEE line
            RuleMark(y: .value("TDEE", tdee))
                .foregroundStyle(GymMarkColors.success)
                .lineStyle(StrokeStyle(lineWidth: 1, dash: [5, 5]))
                .annotation(position: .top, alignment: .trailing) {
                    Text("TDEE")
                        .font(GymMarkTypography.caption)
                        .foregroundColor(GymMarkColors.success)
                        .padding(.horizontal, 4)
                }
        }
        .chartXAxis {
            AxisMarks { value in
                AxisValueLabel()
                    .foregroundStyle(GymMarkColors.textTertiary)
                    .font(GymMarkTypography.caption)
            }
        }
        .chartYAxis {
            AxisMarks { value in
                AxisGridLine(stroke: StrokeStyle(lineWidth: 0.5))
                    .foregroundStyle(GymMarkColors.gridLines)
                AxisValueLabel()
                    .foregroundStyle(GymMarkColors.textTertiary)
                    .font(GymMarkTypography.caption)
            }
        }
    }
}

// MARK: - Data Models
struct WeightEntry: Identifiable {
    let id = UUID()
    let date: Date
    let weight: Double
    
    static var sampleData: [WeightEntry] {
        let calendar = Calendar.current
        let today = Date()
        return (0..<30).map { dayOffset in
            let date = calendar.date(byAdding: .day, value: -dayOffset, to: today)!
            let baseWeight = 175.0
            let variation = Double.random(in: -3...3)
            return WeightEntry(date: date, weight: baseWeight + variation)
        }.reversed()
    }
}

struct CalorieEntry: Identifiable {
    let id = UUID()
    let day: String
    let calories: Double
    
    static var sampleData: [CalorieEntry] = [
        CalorieEntry(day: "M", calories: 2200),
        CalorieEntry(day: "T", calories: 2450),
        CalorieEntry(day: "W", calories: 2100),
        CalorieEntry(day: "T", calories: 2300),
        CalorieEntry(day: "F", calories: 2600),
        CalorieEntry(day: "S", calories: 2800),
        CalorieEntry(day: "S", calories: 2150)
    ]
}

// MARK: - Preview
#Preview {
    ProgressView()
}
