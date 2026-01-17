//
//  GymMarkTabBar.swift
//  GymMark - Scientific Minimalism Design System
//
//  Custom tab bar navigation
//

import SwiftUI

// MARK: - Tab Bar
struct GymMarkTabBar: View {
    @Binding var selectedTab: Int
    
    let tabs: [(icon: String, label: String)] = [
        ("house", "Home"),
        ("book.closed", "Library"),
        ("clock", "History"),
        ("chart.line.uptrend.xyaxis", "Progress")
    ]
    
    var body: some View {
        HStack(spacing: 0) {
            ForEach(Array(tabs.enumerated()), id: \.offset) { index, tab in
                Button {
                    withAnimation(GymMarkAnimation.fade) {
                        selectedTab = index
                    }
                } label: {
                    VStack(spacing: GymMarkSpacing.xxs) {
                        Image(systemName: tab.icon)
                            .font(.system(size: 22, weight: selectedTab == index ? .medium : .light))
                        
                        Text(tab.label)
                            .font(GymMarkTypography.tabLabel)
                    }
                    .foregroundColor(selectedTab == index ? GymMarkColors.textPrimary : GymMarkColors.textMuted)
                    .frame(maxWidth: .infinity)
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.top, GymMarkSpacing.tabBarTopPadding)
        .padding(.bottom, GymMarkSpacing.tabBarBottomPadding)
        .background(
            Rectangle()
                .fill(GymMarkColors.background)
                .overlay(
                    Rectangle()
                        .fill(GymMarkColors.divider)
                        .frame(height: 0.5),
                    alignment: .top
                )
        )
    }
}

// MARK: - Tab Bar Item
struct TabBarItem: View {
    let icon: String
    let label: String
    let isSelected: Bool
    
    var body: some View {
        VStack(spacing: GymMarkSpacing.xxs) {
            Image(systemName: icon)
                .font(.system(size: 22, weight: isSelected ? .medium : .light))
            
            Text(label)
                .font(GymMarkTypography.tabLabel)
        }
        .foregroundColor(isSelected ? GymMarkColors.textPrimary : GymMarkColors.textMuted)
    }
}

// MARK: - Navigation Header
struct NavigationHeader: View {
    let title: String
    var showBackButton: Bool = false
    var backAction: (() -> Void)? = nil
    var rightAction: (() -> Void)? = nil
    var rightIcon: String? = nil
    var rightLabel: String? = nil
    
    var body: some View {
        HStack {
            // Back button
            if showBackButton {
                Button {
                    backAction?()
                } label: {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 18, weight: .medium))
                        .foregroundColor(GymMarkColors.textPrimary)
                        .frame(width: 44, height: 44)
                }
            }
            
            Spacer()
            
            // Title
            Text(title)
                .font(GymMarkTypography.bodyLarge)
                .foregroundColor(GymMarkColors.textPrimary)
            
            Spacer()
            
            // Right action
            if let rightAction = rightAction {
                Button(action: rightAction) {
                    if let rightIcon = rightIcon {
                        Image(systemName: rightIcon)
                            .font(.system(size: 18, weight: .medium))
                            .foregroundColor(GymMarkColors.textPrimary)
                    } else if let rightLabel = rightLabel {
                        Text(rightLabel)
                            .font(GymMarkTypography.buttonSecondary)
                            .foregroundColor(GymMarkColors.success)
                    }
                }
                .frame(width: 44, height: 44)
            } else if showBackButton {
                // Spacer to balance back button
                Color.clear.frame(width: 44, height: 44)
            }
        }
        .frame(height: 44)
        .padding(.horizontal, GymMarkSpacing.screenHorizontal)
    }
}

// MARK: - Workout Header (with timer)
struct WorkoutHeader: View {
    let workoutName: String
    var onBack: (() -> Void)? = nil
    var onFinish: (() -> Void)? = nil
    
    var body: some View {
        HStack {
            // Back button
            Button {
                onBack?()
            } label: {
                Image(systemName: "chevron.left")
                    .font(.system(size: 18, weight: .medium))
                    .foregroundColor(GymMarkColors.textPrimary)
            }
            
            Spacer()
            
            // Title
            Text(workoutName)
                .font(GymMarkTypography.bodyLarge)
                .foregroundColor(GymMarkColors.textPrimary)
            
            Spacer()
            
            // Finish button
            Button {
                onFinish?()
            } label: {
                Text("Done")
                    .font(GymMarkTypography.buttonSecondary)
                    .foregroundColor(GymMarkColors.success)
            }
        }
        .padding(.horizontal, GymMarkSpacing.screenHorizontal)
        .padding(.vertical, GymMarkSpacing.sm)
        .background(
            Rectangle()
                .fill(GymMarkColors.background)
                .overlay(
                    Rectangle()
                        .fill(GymMarkColors.divider)
                        .frame(height: 0.5),
                    alignment: .bottom
                )
        )
    }
}

// MARK: - Preview
#Preview {
    VStack {
        Spacer()
        
        // Navigation header
        NavigationHeader(
            title: "Workout Library",
            showBackButton: true,
            backAction: {},
            rightAction: {},
            rightIcon: "plus"
        )
        
        Spacer()
        
        // Workout header
        WorkoutHeader(
            workoutName: "Active Workout",
            onBack: {},
            onFinish: {}
        )
        
        Spacer()
        
        // Tab bar
        GymMarkTabBar(selectedTab: .constant(0))
    }
    .background(GymMarkColors.background)
}

#Preview("Tab Bar States") {
    VStack(spacing: 32) {
        ForEach(0..<4) { index in
            GymMarkTabBar(selectedTab: .constant(index))
        }
    }
    .background(GymMarkColors.background)
}
