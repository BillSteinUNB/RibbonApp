//
//  ExerciseBrowserView.swift
//  GymMark - Scientific Minimalism Design System
//
//  Search and select exercises
//

import SwiftUI

struct ExerciseBrowserView: View {
    @State private var appeared = false
    @State private var searchText = ""
    @State private var selectedCategory = "All"
    @State private var exercises: [Exercise] = Exercise.sampleData
    
    private let categories = ["All", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core"]
    
    var filteredExercises: [Exercise] {
        exercises.filter { exercise in
            let matchesSearch = searchText.isEmpty || exercise.name.localizedCaseInsensitiveContains(searchText)
            let matchesCategory = selectedCategory == "All" || exercise.category == selectedCategory
            return matchesSearch && matchesCategory
        }
    }
    
    var onSelect: (Exercise) -> Void = { _ in }
    var onDismiss: () -> Void = {}
    
    var body: some View {
        ScreenContainer {
            VStack(spacing: 0) {
                // Header
                NavigationHeader(
                    title: "Exercises",
                    showBackButton: true,
                    backAction: onDismiss
                )
                
                VStack(spacing: GymMarkSpacing.md) {
                    // Search bar
                    SearchField(text: $searchText, placeholder: "Search exercises...")
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.4), value: appeared)
                    
                    // Category pills
                    CategoryPillRow(categories: categories, selectedCategory: $selectedCategory)
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.4).delay(0.1), value: appeared)
                }
                .padding(.horizontal, GymMarkSpacing.screenHorizontal)
                .padding(.top, GymMarkSpacing.md)
                
                // Exercise list
                ScrollView(showsIndicators: false) {
                    LazyVStack(spacing: GymMarkSpacing.sm) {
                        ForEach(Array(filteredExercises.enumerated()), id: \.element.id) { index, exercise in
                            ExerciseRow(exercise: exercise) {
                                onSelect(exercise)
                            }
                            .opacity(appeared ? 1 : 0)
                            .offset(y: appeared ? 0 : 20)
                            .animation(
                                .easeOut(duration: 0.3).delay(0.15 + Double(index) * 0.03),
                                value: appeared
                            )
                        }
                        
                        // Bottom padding
                        Spacer().frame(height: GymMarkSpacing.xl)
                    }
                    .padding(.horizontal, GymMarkSpacing.screenHorizontal)
                    .padding(.top, GymMarkSpacing.md)
                }
            }
        }
        .onAppear {
            appeared = true
        }
    }
}

// MARK: - Exercise Row
struct ExerciseRow: View {
    let exercise: Exercise
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: GymMarkSpacing.xxs) {
                Text(exercise.name)
                    .font(GymMarkTypography.bodyLarge)
                    .foregroundColor(GymMarkColors.textPrimary)
                
                HStack(spacing: GymMarkSpacing.xs) {
                    Text(exercise.category)
                    Text("•")
                    Text(exercise.equipment)
                }
                .font(GymMarkTypography.bodySmall)
                .foregroundColor(GymMarkColors.textSecondary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(GymMarkSpacing.md)
            .background(
                RoundedRectangle(cornerRadius: GymMarkSpacing.inputRadius)
                    .fill(GymMarkColors.cardFill)
                    .overlay(
                        RoundedRectangle(cornerRadius: GymMarkSpacing.inputRadius)
                            .stroke(GymMarkColors.cardBorder, lineWidth: 1)
                    )
            )
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Data Model
struct Exercise: Identifiable {
    let id = UUID()
    let name: String
    let category: String
    let equipment: String
    
    static var sampleData: [Exercise] = [
        Exercise(name: "Bench Press", category: "Chest", equipment: "Barbell"),
        Exercise(name: "Incline Dumbbell Press", category: "Chest", equipment: "Dumbbell"),
        Exercise(name: "Cable Flyes", category: "Chest", equipment: "Cable"),
        Exercise(name: "Push-ups", category: "Chest", equipment: "Bodyweight"),
        Exercise(name: "Deadlift", category: "Back", equipment: "Barbell"),
        Exercise(name: "Pull-ups", category: "Back", equipment: "Bodyweight"),
        Exercise(name: "Barbell Row", category: "Back", equipment: "Barbell"),
        Exercise(name: "Lat Pulldown", category: "Back", equipment: "Cable"),
        Exercise(name: "Squat", category: "Legs", equipment: "Barbell"),
        Exercise(name: "Leg Press", category: "Legs", equipment: "Machine"),
        Exercise(name: "Romanian Deadlift", category: "Legs", equipment: "Barbell"),
        Exercise(name: "Leg Curl", category: "Legs", equipment: "Machine"),
        Exercise(name: "Overhead Press", category: "Shoulders", equipment: "Barbell"),
        Exercise(name: "Lateral Raises", category: "Shoulders", equipment: "Dumbbell"),
        Exercise(name: "Bicep Curls", category: "Arms", equipment: "Dumbbell"),
        Exercise(name: "Tricep Pushdown", category: "Arms", equipment: "Cable")
    ]
}

// MARK: - Preview
#Preview {
    ExerciseBrowserView()
}
