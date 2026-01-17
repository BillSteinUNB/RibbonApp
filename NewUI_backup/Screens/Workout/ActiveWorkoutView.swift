//
//  ActiveWorkoutView.swift
//  GymMark - Scientific Minimalism Design System
//
//  Live workout tracking with timer, exercises, sets, and reps
//

import SwiftUI

struct ActiveWorkoutView: View {
    @State private var elapsedTime: TimeInterval = 1965 // 32:45 for demo
    @State private var exercises: [WorkoutExercise] = WorkoutExercise.sampleData
    @State private var appeared = false
    
    var workoutName: String = "Active Workout"
    var onBack: () -> Void = {}
    var onFinish: () -> Void = {}
    
    private let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()
    
    var body: some View {
        ScreenContainer {
            VStack(spacing: 0) {
                // Header
                WorkoutHeader(
                    workoutName: workoutName,
                    onBack: onBack,
                    onFinish: onFinish
                )
                
                ScrollView(showsIndicators: false) {
                    VStack(spacing: GymMarkSpacing.lg) {
                        // Timer display
                        timerSection
                            .opacity(appeared ? 1 : 0)
                            .animation(.easeOut(duration: 0.5), value: appeared)
                        
                        GymMarkDivider()
                        
                        // Exercise list
                        exerciseList
                        
                        // Add Exercise button
                        addExerciseButton
                            .opacity(appeared ? 1 : 0)
                            .animation(.easeOut(duration: 0.5).delay(0.3), value: appeared)
                        
                        // Bottom padding
                        Spacer().frame(height: GymMarkSpacing.xl)
                    }
                    .padding(.horizontal, GymMarkSpacing.screenHorizontal)
                    .padding(.top, GymMarkSpacing.lg)
                }
                
                // Finish Workout button
                finishButton
            }
        }
        .onAppear {
            appeared = true
        }
        .onReceive(timer) { _ in
            elapsedTime += 1
        }
    }
    
    // MARK: - Timer Section
    private var timerSection: some View {
        VStack(spacing: GymMarkSpacing.xs) {
            Text("Workout Time")
                .labelStyle()
            
            Text(formatTime(elapsedTime))
                .font(GymMarkTypography.dataLarge)
                .foregroundColor(GymMarkColors.textPrimary)
                .monospacedDigit()
        }
    }
    
    // MARK: - Exercise List
    private var exerciseList: some View {
        VStack(spacing: GymMarkSpacing.lg) {
            ForEach(Array(exercises.enumerated()), id: \.element.id) { index, exercise in
                ExerciseBlock(exercise: $exercises[index])
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : 20)
                    .animation(
                        .easeOut(duration: 0.5).delay(0.1 + Double(index) * 0.08),
                        value: appeared
                    )
            }
        }
    }
    
    // MARK: - Add Exercise Button
    private var addExerciseButton: some View {
        Button {
            // Add exercise action
        } label: {
            HStack(spacing: GymMarkSpacing.xs) {
                Image(systemName: "plus")
                    .font(.system(size: 16, weight: .medium))
                Text("Add Exercise")
                    .font(GymMarkTypography.buttonSecondary)
            }
            .foregroundColor(GymMarkColors.textSecondary)
            .frame(maxWidth: .infinity)
            .padding(.vertical, GymMarkSpacing.md)
            .background(
                RoundedRectangle(cornerRadius: GymMarkSpacing.cardRadius)
                    .stroke(GymMarkColors.cardBorder, style: StrokeStyle(lineWidth: 1, dash: [8]))
            )
        }
    }
    
    // MARK: - Finish Button
    private var finishButton: some View {
        FilledButton(title: "Finish Workout", action: onFinish)
            .padding(.horizontal, GymMarkSpacing.screenHorizontal)
            .padding(.vertical, GymMarkSpacing.md)
            .background(GymMarkColors.background)
    }
    
    // MARK: - Helpers
    private func formatTime(_ interval: TimeInterval) -> String {
        let hours = Int(interval) / 3600
        let minutes = (Int(interval) % 3600) / 60
        let seconds = Int(interval) % 60
        
        if hours > 0 {
            return String(format: "%d:%02d:%02d", hours, minutes, seconds)
        } else {
            return String(format: "%02d:%02d", minutes, seconds)
        }
    }
}

// MARK: - Exercise Block
struct ExerciseBlock: View {
    @Binding var exercise: WorkoutExercise
    
    var body: some View {
        VStack(alignment: .leading, spacing: GymMarkSpacing.md) {
            // Header
            HStack {
                Text(exercise.name)
                    .font(GymMarkTypography.h4)
                    .foregroundColor(GymMarkColors.textPrimary)
                
                Spacer()
                
                RepRangeBadge(range: exercise.repRange)
            }
            
            // Sets
            VStack(spacing: GymMarkSpacing.sm) {
                ForEach(Array(exercise.sets.enumerated()), id: \.element.id) { index, set in
                    WorkoutSetInputRow(
                        setNumber: index + 1,
                        weight: Binding(
                            get: { set.weight },
                            set: { exercise.sets[index].weight = $0 }
                        ),
                        reps: Binding(
                            get: { set.reps },
                            set: { exercise.sets[index].reps = $0 }
                        ),
                        isPR: set.isPR,
                        isCompleted: set.isCompleted
                    )
                }
                
                // Add Set button
                Button {
                    exercise.sets.append(WorkoutSet(weight: "", reps: ""))
                } label: {
                    HStack(spacing: GymMarkSpacing.xxs) {
                        Image(systemName: "plus")
                            .font(.system(size: 12))
                        Text("Add Set")
                            .font(GymMarkTypography.bodySmall)
                    }
                    .foregroundColor(GymMarkColors.textSecondary)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, GymMarkSpacing.sm)
                }
            }
        }
        .gymMarkCard()
    }
}

// MARK: - Data Models
struct WorkoutExercise: Identifiable {
    let id = UUID()
    var name: String
    var repRange: String
    var sets: [WorkoutSet]
    
    static var sampleData: [WorkoutExercise] = [
        WorkoutExercise(
            name: "Bench Press",
            repRange: "8-12",
            sets: [
                WorkoutSet(weight: "135", reps: "12", isCompleted: true),
                WorkoutSet(weight: "135", reps: "10", isCompleted: true, isPR: true),
                WorkoutSet(weight: "", reps: "")
            ]
        ),
        WorkoutExercise(
            name: "Incline Dumbbell Press",
            repRange: "10-15",
            sets: [
                WorkoutSet(weight: "", reps: "")
            ]
        )
    ]
}

struct WorkoutSet: Identifiable {
    let id = UUID()
    var weight: String
    var reps: String
    var isCompleted: Bool = false
    var isPR: Bool = false
}

// MARK: - Preview
#Preview {
    ActiveWorkoutView()
}
