//
//  WorkoutLibraryView.swift
//  GymMark - Scientific Minimalism Design System
//
//  Browse and manage workout templates
//

import SwiftUI

struct WorkoutLibraryView: View {
    @State private var appeared = false
    @State private var workouts: [WorkoutTemplate] = WorkoutTemplate.sampleData
    
    var body: some View {
        ScreenContainer {
            VStack(spacing: 0) {
                // Header
                NavigationHeader(
                    title: "Library",
                    rightAction: {},
                    rightIcon: "plus"
                )
                
                if workouts.isEmpty {
                    // Empty state
                    EmptyStateView(
                        icon: "plus.circle",
                        title: "No Workouts Yet",
                        message: "Create your first workout template to get started",
                        actionTitle: "Create Workout",
                        action: {}
                    )
                } else {
                    // Workout list
                    ScrollView(showsIndicators: false) {
                        VStack(spacing: GymMarkSpacing.md) {
                            SectionHeader(title: "Your Workouts")
                            
                            ForEach(Array(workouts.enumerated()), id: \.element.id) { index, workout in
                                WorkoutTemplateRow(workout: workout)
                                    .opacity(appeared ? 1 : 0)
                                    .offset(y: appeared ? 0 : 20)
                                    .animation(
                                        .easeOut(duration: 0.4).delay(Double(index) * 0.08),
                                        value: appeared
                                    )
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

// MARK: - Workout Template Row
struct WorkoutTemplateRow: View {
    let workout: WorkoutTemplate
    
    var body: some View {
        ListRowCard(action: {}) {
            VStack(alignment: .leading, spacing: GymMarkSpacing.xxs) {
                Text(workout.name)
                    .font(GymMarkTypography.bodyLarge)
                    .foregroundColor(GymMarkColors.textPrimary)
                
                Text("\(workout.exerciseCount) exercises")
                    .font(GymMarkTypography.bodySmall)
                    .foregroundColor(GymMarkColors.textSecondary)
            }
        }
    }
}

// MARK: - Data Model
struct WorkoutTemplate: Identifiable {
    let id = UUID()
    let name: String
    let exerciseCount: Int
    
    static var sampleData: [WorkoutTemplate] = [
        WorkoutTemplate(name: "Push Day A", exerciseCount: 5),
        WorkoutTemplate(name: "Pull Day A", exerciseCount: 6),
        WorkoutTemplate(name: "Legs", exerciseCount: 7),
        WorkoutTemplate(name: "Push Day B", exerciseCount: 5),
        WorkoutTemplate(name: "Pull Day B", exerciseCount: 6)
    ]
}

// MARK: - Preview
#Preview {
    WorkoutLibraryView()
}

#Preview("Empty State") {
    ScreenContainer {
        EmptyStateView(
            icon: "plus.circle",
            title: "No Workouts Yet",
            message: "Create your first workout template to get started",
            actionTitle: "Create Workout",
            action: {}
        )
    }
}
