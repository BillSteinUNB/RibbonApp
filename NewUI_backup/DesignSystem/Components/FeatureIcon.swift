//
//  FeatureIcon.swift
//  GymMark - Scientific Minimalism Design System
//
//  Circular icon containers for onboarding and feature highlights
//

import SwiftUI

// MARK: - Feature Icon (Circular container)
struct FeatureIcon: View {
    let systemName: String
    var size: CGFloat = 64
    var strokeWidth: CGFloat = 1.5
    
    var body: some View {
        ZStack {
            Circle()
                .stroke(GymMarkColors.textPrimary, lineWidth: strokeWidth)
                .frame(width: size, height: size)
            
            Image(systemName: systemName)
                .font(.system(size: size * 0.4, weight: .light))
                .foregroundColor(GymMarkColors.textPrimary)
        }
    }
}

// MARK: - App Logo Icon
struct AppLogoIcon: View {
    var size: CGFloat = 80
    
    var body: some View {
        ZStack {
            // Outer circle
            Circle()
                .stroke(GymMarkColors.textPrimary, lineWidth: 1.5)
                .frame(width: size, height: size)
            
            // Grid pattern inside
            Canvas { context, canvasSize in
                let center = CGPoint(x: canvasSize.width / 2, y: canvasSize.height / 2)
                let gridSize = size * 0.5
                let cellSize = gridSize / 3
                let startX = center.x - gridSize / 2
                let startY = center.y - gridSize / 2
                
                // Draw grid lines
                for i in 0...3 {
                    let offset = CGFloat(i) * cellSize
                    
                    // Vertical
                    var vPath = Path()
                    vPath.move(to: CGPoint(x: startX + offset, y: startY))
                    vPath.addLine(to: CGPoint(x: startX + offset, y: startY + gridSize))
                    context.stroke(vPath, with: .color(GymMarkColors.textPrimary), lineWidth: 1)
                    
                    // Horizontal
                    var hPath = Path()
                    hPath.move(to: CGPoint(x: startX, y: startY + offset))
                    hPath.addLine(to: CGPoint(x: startX + gridSize, y: startY + offset))
                    context.stroke(hPath, with: .color(GymMarkColors.textPrimary), lineWidth: 1)
                }
            }
            .frame(width: size, height: size)
            
            // G letterform
            Text("G")
                .font(.system(size: size * 0.35, weight: .bold, design: .default))
                .foregroundColor(GymMarkColors.textPrimary)
        }
    }
}

// MARK: - Page Indicator
struct PageIndicator: View {
    let totalPages: Int
    let currentPage: Int
    
    var body: some View {
        HStack(spacing: GymMarkSpacing.xs) {
            ForEach(0..<totalPages, id: \.self) { index in
                Circle()
                    .fill(index == currentPage ? GymMarkColors.textPrimary : GymMarkColors.textMuted)
                    .frame(width: 8, height: 8)
                    .animation(GymMarkAnimation.selection, value: currentPage)
            }
        }
    }
}

// MARK: - Section Header
struct SectionHeader: View {
    let title: String
    var action: (() -> Void)? = nil
    var actionLabel: String? = nil
    
    var body: some View {
        HStack {
            Text(title)
                .labelStyle()
            
            Spacer()
            
            if let action = action, let actionLabel = actionLabel {
                Button(action: action) {
                    Text(actionLabel)
                        .font(GymMarkTypography.bodySmall)
                        .foregroundColor(GymMarkColors.textSecondary)
                }
            }
        }
    }
}

// MARK: - Divider
struct GymMarkDivider: View {
    var body: some View {
        Rectangle()
            .fill(GymMarkColors.divider)
            .frame(height: 1)
    }
}

// MARK: - Empty State
struct EmptyStateView: View {
    let icon: String
    let title: String
    let message: String
    var actionTitle: String? = nil
    var action: (() -> Void)? = nil
    
    var body: some View {
        VStack(spacing: GymMarkSpacing.lg) {
            FeatureIcon(systemName: icon, size: 80)
            
            VStack(spacing: GymMarkSpacing.xs) {
                Text(title)
                    .font(GymMarkTypography.h3)
                    .foregroundColor(GymMarkColors.textPrimary)
                
                Text(message)
                    .font(GymMarkTypography.body)
                    .foregroundColor(GymMarkColors.textSecondary)
                    .multilineTextAlignment(.center)
            }
            
            if let actionTitle = actionTitle, let action = action {
                PrimaryButton(title: actionTitle, action: action)
                    .padding(.horizontal, GymMarkSpacing.xxl)
            }
        }
        .padding(GymMarkSpacing.xl)
    }
}

// MARK: - Preview
#Preview {
    ScreenContainer {
        ScrollView {
            VStack(spacing: GymMarkSpacing.xl) {
                Text("Icons & Indicators")
                    .font(GymMarkTypography.h2)
                    .foregroundColor(GymMarkColors.textPrimary)
                
                // Feature icons
                HStack(spacing: GymMarkSpacing.lg) {
                    FeatureIcon(systemName: "heart", size: 48)
                    FeatureIcon(systemName: "scalemass", size: 64)
                    FeatureIcon(systemName: "figure.run", size: 80)
                }
                
                // App logo
                Text("App Logo")
                    .labelStyle()
                    .frame(maxWidth: .infinity, alignment: .leading)
                
                AppLogoIcon(size: 80)
                
                // Page indicators
                Text("Page Indicators")
                    .labelStyle()
                    .frame(maxWidth: .infinity, alignment: .leading)
                
                VStack(spacing: GymMarkSpacing.md) {
                    PageIndicator(totalPages: 3, currentPage: 0)
                    PageIndicator(totalPages: 5, currentPage: 2)
                    PageIndicator(totalPages: 4, currentPage: 3)
                }
                
                // Section headers
                SectionHeader(title: "Activity")
                SectionHeader(title: "Statistics", action: {}, actionLabel: "See All")
                
                GymMarkDivider()
                
                // Empty state
                EmptyStateView(
                    icon: "plus.circle",
                    title: "No Workouts Yet",
                    message: "Create your first workout template to get started",
                    actionTitle: "Create Workout",
                    action: {}
                )
            }
            .padding(GymMarkSpacing.screenHorizontal)
        }
    }
}
