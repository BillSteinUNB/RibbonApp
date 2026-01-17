//
//  TrainingSplitView.swift
//  GymMark - Scientific Minimalism Design System
//
//  Choose workout program structure
//

import SwiftUI

struct TrainingSplitView: View {
    @State private var appeared = false
    @State private var selectedSplit: TrainingSplit? = nil
    
    var onContinue: (TrainingSplit) -> Void = { _ in }
    
    var body: some View {
        ScreenContainer {
            VStack(spacing: 0) {
                // Header
                NavigationHeader(title: "Training Split", showBackButton: true)
                
                ScrollView(showsIndicators: false) {
                    VStack(spacing: GymMarkSpacing.lg) {
                        // Recommended section
                        VStack(alignment: .leading, spacing: GymMarkSpacing.md) {
                            Text("Recommended For You")
                                .labelStyle()
                            
                            GymMarkDivider()
                            
                            LazyVGrid(columns: [
                                GridItem(.flexible(), spacing: GymMarkSpacing.md),
                                GridItem(.flexible(), spacing: GymMarkSpacing.md)
                            ], spacing: GymMarkSpacing.md) {
                                ForEach(TrainingSplit.recommended) { split in
                                    TrainingSplitCard(
                                        split: split,
                                        isSelected: selectedSplit == split,
                                        isRecommended: true
                                    ) {
                                        selectedSplit = split
                                    }
                                    .opacity(appeared ? 1 : 0)
                                    .animation(.easeOut(duration: 0.4).delay(0.1), value: appeared)
                                }
                            }
                        }
                        
                        // All programs section
                        VStack(alignment: .leading, spacing: GymMarkSpacing.md) {
                            Text("All Programs")
                                .labelStyle()
                            
                            GymMarkDivider()
                            
                            LazyVGrid(columns: [
                                GridItem(.flexible(), spacing: GymMarkSpacing.md),
                                GridItem(.flexible(), spacing: GymMarkSpacing.md)
                            ], spacing: GymMarkSpacing.md) {
                                ForEach(Array(TrainingSplit.allSplits.enumerated()), id: \.element.id) { index, split in
                                    TrainingSplitCard(
                                        split: split,
                                        isSelected: selectedSplit == split,
                                        isRecommended: false
                                    ) {
                                        selectedSplit = split
                                    }
                                    .opacity(appeared ? 1 : 0)
                                    .animation(
                                        .easeOut(duration: 0.4).delay(0.2 + Double(index) * 0.05),
                                        value: appeared
                                    )
                                }
                            }
                        }
                        
                        Spacer().frame(height: GymMarkSpacing.xxl + GymMarkSpacing.buttonHeight)
                    }
                    .padding(.horizontal, GymMarkSpacing.screenHorizontal)
                    .padding(.top, GymMarkSpacing.lg)
                }
                
                // Continue button
                PrimaryButton(
                    title: "Continue",
                    action: {
                        if let split = selectedSplit {
                            onContinue(split)
                        }
                    },
                    disabled: selectedSplit == nil
                )
                .padding(.horizontal, GymMarkSpacing.screenHorizontal)
                .padding(.vertical, GymMarkSpacing.md)
                .background(GymMarkColors.background)
            }
        }
        .onAppear {
            appeared = true
        }
    }
}

// MARK: - Training Split Card
struct TrainingSplitCard: View {
    let split: TrainingSplit
    let isSelected: Bool
    let isRecommended: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: GymMarkSpacing.sm) {
                // Icon
                Image(systemName: "dumbbell.fill")
                    .font(.system(size: 32, weight: .light))
                    .foregroundColor(GymMarkColors.textPrimary)
                
                // Name
                Text(split.name)
                    .font(GymMarkTypography.bodyLarge)
                    .foregroundColor(GymMarkColors.textPrimary)
                
                // Frequency
                Text(split.frequency)
                    .font(GymMarkTypography.caption)
                    .foregroundColor(GymMarkColors.textSecondary)
                
                // Best badge
                if split.isBest {
                    Text("✓ Best")
                        .font(GymMarkTypography.caption)
                        .foregroundColor(GymMarkColors.success)
                }
            }
            .frame(maxWidth: .infinity)
            .padding(GymMarkSpacing.cardPadding)
            .background(
                RoundedRectangle(cornerRadius: GymMarkSpacing.cardRadius)
                    .fill(isSelected ? GymMarkColors.selectedBackground : Color.clear)
                    .overlay(
                        RoundedRectangle(cornerRadius: GymMarkSpacing.cardRadius)
                            .stroke(
                                isSelected ? GymMarkColors.textPrimary :
                                    (isRecommended ? GymMarkColors.success.opacity(0.5) : GymMarkColors.cardBorder),
                                lineWidth: isSelected ? 1.5 : 1
                            )
                    )
            )
        }
        .buttonStyle(.plain)
        .animation(GymMarkAnimation.selection, value: isSelected)
    }
}

// MARK: - Data Model
struct TrainingSplit: Identifiable, Equatable {
    let id = UUID()
    let name: String
    let frequency: String
    var isBest: Bool = false
    
    static func == (lhs: TrainingSplit, rhs: TrainingSplit) -> Bool {
        lhs.id == rhs.id
    }
    
    static var recommended: [TrainingSplit] = [
        TrainingSplit(name: "PPL", frequency: "3 days/wk", isBest: true),
        TrainingSplit(name: "Upper/Lower", frequency: "4 days/wk")
    ]
    
    static var allSplits: [TrainingSplit] = [
        TrainingSplit(name: "Full Body", frequency: "3 days/wk"),
        TrainingSplit(name: "Bro Split", frequency: "5 days/wk"),
        TrainingSplit(name: "PHUL", frequency: "4 days/wk"),
        TrainingSplit(name: "PHAT", frequency: "5 days/wk")
    ]
}

// MARK: - Preview
#Preview {
    TrainingSplitView()
}
