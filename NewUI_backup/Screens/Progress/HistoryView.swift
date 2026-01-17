//
//  HistoryView.swift
//  GymMark - Scientific Minimalism Design System
//
//  View completed workout history grouped by date
//

import SwiftUI

struct HistoryView: View {
    @State private var appeared = false
    @State private var history: [HistorySection] = HistorySection.sampleData
    
    var body: some View {
        ScreenContainer {
            VStack(spacing: 0) {
                // Header
                Text("History")
                    .font(GymMarkTypography.h2)
                    .tracking(-1)
                    .foregroundColor(GymMarkColors.textPrimary)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, GymMarkSpacing.screenHorizontal)
                    .padding(.top, GymMarkSpacing.lg)
                
                if history.isEmpty {
                    // Empty state
                    Spacer()
                    EmptyStateView(
                        icon: "calendar",
                        title: "No Workouts Yet",
                        message: "Complete your first workout to see it here"
                    )
                    Spacer()
                } else {
                    // History list
                    ScrollView(showsIndicators: false) {
                        VStack(spacing: GymMarkSpacing.lg) {
                            ForEach(Array(history.enumerated()), id: \.element.id) { sectionIndex, section in
                                VStack(alignment: .leading, spacing: GymMarkSpacing.md) {
                                    // Date header
                                    Text(section.dateLabel)
                                        .labelStyle()
                                    
                                    GymMarkDivider()
                                    
                                    // Workout entries
                                    ForEach(Array(section.workouts.enumerated()), id: \.element.id) { workoutIndex, workout in
                                        HistoryEntryRow(entry: workout)
                                            .opacity(appeared ? 1 : 0)
                                            .offset(y: appeared ? 0 : 20)
                                            .animation(
                                                .easeOut(duration: 0.4).delay(Double(sectionIndex * 3 + workoutIndex) * 0.06),
                                                value: appeared
                                            )
                                    }
                                }
                            }
                            
                            // Bottom padding for tab bar
                            Spacer().frame(height: GymMarkSpacing.xxl)
                        }
                        .padding(.horizontal, GymMarkSpacing.screenHorizontal)
                        .padding(.top, GymMarkSpacing.lg)
                    }
                }
            }
        }
        .onAppear {
            appeared = true
        }
    }
}

// MARK: - History Entry Row
struct HistoryEntryRow: View {
    let entry: HistoryEntry
    
    var body: some View {
        VStack(alignment: .leading, spacing: GymMarkSpacing.xs) {
            Text(entry.workoutName)
                .font(GymMarkTypography.bodyLarge)
                .foregroundColor(GymMarkColors.textPrimary)
            
            HStack(spacing: GymMarkSpacing.xs) {
                Text(entry.duration)
                Text("•")
                Text("\(entry.exerciseCount) exercises")
                if entry.prCount > 0 {
                    Text("•")
                    HStack(spacing: 2) {
                        Text("\(entry.prCount)")
                        Image(systemName: "trophy.fill")
                            .font(.system(size: 10))
                    }
                    .foregroundColor(GymMarkColors.success)
                }
            }
            .font(GymMarkTypography.bodySmall)
            .foregroundColor(GymMarkColors.textSecondary)
            
            Text(entry.time)
                .font(GymMarkTypography.caption)
                .foregroundColor(GymMarkColors.textTertiary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .gymMarkCard()
    }
}

// MARK: - Data Models
struct HistorySection: Identifiable {
    let id = UUID()
    let dateLabel: String
    let workouts: [HistoryEntry]
    
    static var sampleData: [HistorySection] = [
        HistorySection(
            dateLabel: "Today",
            workouts: [
                HistoryEntry(workoutName: "Push Day A", duration: "52 min", exerciseCount: 5, prCount: 3, time: "9:32 AM")
            ]
        ),
        HistorySection(
            dateLabel: "Yesterday",
            workouts: [
                HistoryEntry(workoutName: "Pull Day A", duration: "48 min", exerciseCount: 6, prCount: 1, time: "10:15 AM")
            ]
        ),
        HistorySection(
            dateLabel: "January 15",
            workouts: [
                HistoryEntry(workoutName: "Legs", duration: "65 min", exerciseCount: 7, prCount: 0, time: "8:45 AM")
            ]
        )
    ]
}

struct HistoryEntry: Identifiable {
    let id = UUID()
    let workoutName: String
    let duration: String
    let exerciseCount: Int
    let prCount: Int
    let time: String
}

// MARK: - Preview
#Preview {
    HistoryView()
}
