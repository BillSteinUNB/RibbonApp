//
//  HomeDashboardView.swift
//  GymMark - Scientific Minimalism Design System
//
//  Main dashboard with greeting, quick actions, and activity overview
//

import SwiftUI

struct HomeDashboardView: View {
    @State private var appeared = false
    @State private var activityPeriod: HeatmapGrid.HeatmapPeriod = .week
    
    var userName: String = "Bill"
    var onStartWorkout: () -> Void = {}
    
    private var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        switch hour {
        case 5..<12: return "Good Morning"
        case 12..<17: return "Good Afternoon"
        case 17..<21: return "Good Evening"
        default: return "Good Night"
        }
    }
    
    var body: some View {
        ScreenContainer {
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: GymMarkSpacing.lg) {
                    // Header
                    headerSection
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 20)
                        .animation(.easeOut(duration: 0.5), value: appeared)
                    
                    // Start Workout CTA
                    startWorkoutButton
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 20)
                        .animation(.easeOut(duration: 0.5).delay(0.1), value: appeared)
                    
                    // Activity Heatmap
                    activitySection
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 20)
                        .animation(.easeOut(duration: 0.5).delay(0.2), value: appeared)
                    
                    // Statistics
                    statisticsSection
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 20)
                        .animation(.easeOut(duration: 0.5).delay(0.3), value: appeared)
                    
                    // Recent Workouts
                    recentWorkoutsSection
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 20)
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
        VStack(alignment: .leading, spacing: GymMarkSpacing.xxs) {
            Text(greeting)
                .font(GymMarkTypography.body)
                .foregroundColor(GymMarkColors.textSecondary)
            
            Text(userName)
                .font(GymMarkTypography.h2)
                .tracking(-1)
                .foregroundColor(GymMarkColors.textPrimary)
            
            Text("Ready to train?")
                .font(GymMarkTypography.body)
                .foregroundColor(GymMarkColors.textTertiary)
        }
    }
    
    // MARK: - Start Workout Button
    private var startWorkoutButton: some View {
        PrimaryButton(
            title: "Start Workout",
            action: onStartWorkout,
            showArrow: true
        )
    }
    
    // MARK: - Activity Section
    private var activitySection: some View {
        VStack(spacing: GymMarkSpacing.md) {
            // Header with period selector
            HStack {
                Text("Activity")
                    .labelStyle()
                
                Spacer()
                
                Menu {
                    ForEach(HeatmapGrid.HeatmapPeriod.allCases, id: \.self) { period in
                        Button(period.rawValue) {
                            activityPeriod = period
                        }
                    }
                } label: {
                    HStack(spacing: GymMarkSpacing.xxs) {
                        Text(activityPeriod.rawValue)
                            .font(GymMarkTypography.bodySmall)
                            .foregroundColor(GymMarkColors.textSecondary)
                        
                        Image(systemName: "chevron.down")
                            .font(.system(size: 10, weight: .medium))
                            .foregroundColor(GymMarkColors.textTertiary)
                    }
                }
            }
            
            HeatmapGrid(data: [:], period: activityPeriod)
        }
        .gymMarkCard()
    }
    
    // MARK: - Statistics Section
    private var statisticsSection: some View {
        VStack(alignment: .leading, spacing: GymMarkSpacing.md) {
            Text("Statistics")
                .labelStyle()
            
            StatRow(stats: [
                ("24", "Sessions"),
                ("52m", "Avg Time"),
                ("8", "PRs")
            ])
        }
    }
    
    // MARK: - Recent Workouts Section
    private var recentWorkoutsSection: some View {
        VStack(alignment: .leading, spacing: GymMarkSpacing.md) {
            SectionHeader(title: "Recent Workouts", action: {}, actionLabel: "See All")
            
            VStack(spacing: GymMarkSpacing.sm) {
                RecentWorkoutRow(
                    name: "Push Day A",
                    duration: "52 min",
                    exerciseCount: 5,
                    prCount: 2,
                    date: "Today"
                )
                
                RecentWorkoutRow(
                    name: "Pull Day A",
                    duration: "48 min",
                    exerciseCount: 6,
                    prCount: 1,
                    date: "Yesterday"
                )
            }
        }
    }
}

// MARK: - Recent Workout Row
struct RecentWorkoutRow: View {
    let name: String
    let duration: String
    let exerciseCount: Int
    let prCount: Int
    let date: String
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: GymMarkSpacing.xxs) {
                Text(name)
                    .font(GymMarkTypography.bodyLarge)
                    .foregroundColor(GymMarkColors.textPrimary)
                
                HStack(spacing: GymMarkSpacing.xs) {
                    Text(duration)
                    Text("•")
                    Text("\(exerciseCount) exercises")
                    if prCount > 0 {
                        Text("•")
                        HStack(spacing: 2) {
                            Text("\(prCount)")
                            Image(systemName: "trophy.fill")
                                .font(.system(size: 10))
                        }
                        .foregroundColor(GymMarkColors.success)
                    }
                }
                .font(GymMarkTypography.bodySmall)
                .foregroundColor(GymMarkColors.textSecondary)
            }
            
            Spacer()
            
            Text(date)
                .font(GymMarkTypography.caption)
                .foregroundColor(GymMarkColors.textTertiary)
        }
        .gymMarkCard()
    }
}

// MARK: - Preview
#Preview {
    HomeDashboardView()
}
