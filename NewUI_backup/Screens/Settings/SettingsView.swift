//
//  SettingsView.swift
//  GymMark - Scientific Minimalism Design System
//
//  App configuration and account management
//

import SwiftUI

struct SettingsView: View {
    @State private var appeared = false
    @State private var weightUnit = "lbs"
    @State private var doubleProgression = true
    @State private var showRestTimer = true
    @State private var restDuration = 90
    
    var body: some View {
        ScreenContainer {
            ScrollView(showsIndicators: false) {
                VStack(spacing: GymMarkSpacing.xl) {
                    // Header
                    Text("Settings")
                        .font(GymMarkTypography.h2)
                        .tracking(-1)
                        .foregroundColor(GymMarkColors.textPrimary)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.5), value: appeared)
                    
                    // Units section
                    unitsSection
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.5).delay(0.1), value: appeared)
                    
                    // Workout section
                    workoutSection
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.5).delay(0.2), value: appeared)
                    
                    // Account section
                    accountSection
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.5).delay(0.3), value: appeared)
                    
                    // Danger zone
                    dangerSection
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.5).delay(0.4), value: appeared)
                    
                    // App info
                    appInfoSection
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.5).delay(0.5), value: appeared)
                    
                    // Bottom padding
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
    
    // MARK: - Units Section
    private var unitsSection: some View {
        VStack(alignment: .leading, spacing: GymMarkSpacing.md) {
            Text("Units")
                .labelStyle()
            
            GymMarkDivider()
            
            SettingsRow(title: "Weight Unit") {
                GymMarkSegmentedControl(
                    options: ["lbs", "kg"],
                    selectedOption: $weightUnit
                )
                .frame(width: 120)
            }
        }
    }
    
    // MARK: - Workout Section
    private var workoutSection: some View {
        VStack(alignment: .leading, spacing: GymMarkSpacing.md) {
            Text("Workout")
                .labelStyle()
            
            GymMarkDivider()
            
            SettingsToggleRow(
                title: "Double Progression",
                subtitle: "Increase reps before adding weight",
                isOn: $doubleProgression
            )
            
            SettingsToggleRow(
                title: "Rest Timer",
                subtitle: "Show countdown between sets",
                isOn: $showRestTimer
            )
            
            if showRestTimer {
                SettingsRow(title: "Rest Duration") {
                    HStack(spacing: GymMarkSpacing.xs) {
                        Text("\(restDuration)s")
                            .font(GymMarkTypography.dataMini)
                            .foregroundColor(GymMarkColors.textPrimary)
                        
                        Stepper("", value: $restDuration, in: 30...300, step: 15)
                            .labelsHidden()
                            .tint(GymMarkColors.textPrimary)
                    }
                }
            }
        }
    }
    
    // MARK: - Account Section
    private var accountSection: some View {
        VStack(alignment: .leading, spacing: GymMarkSpacing.md) {
            Text("Account")
                .labelStyle()
            
            GymMarkDivider()
            
            SettingsNavigationRow(title: "Manage Subscription", icon: "creditcard") {}
            SettingsNavigationRow(title: "Export Data", icon: "square.and.arrow.up") {}
            SettingsNavigationRow(title: "Connect Health", icon: "heart") {}
        }
    }
    
    // MARK: - Danger Zone
    private var dangerSection: some View {
        VStack(alignment: .leading, spacing: GymMarkSpacing.md) {
            Text("Danger Zone")
                .labelStyle()
            
            GymMarkDivider()
            
            Button {} label: {
                HStack {
                    Text("Reset All Data")
                        .font(GymMarkTypography.body)
                        .foregroundColor(GymMarkColors.danger)
                    Spacer()
                }
                .padding(GymMarkSpacing.md)
            }
            
            Button {} label: {
                HStack {
                    Text("Delete Account")
                        .font(GymMarkTypography.body)
                        .foregroundColor(GymMarkColors.danger)
                    Spacer()
                }
                .padding(GymMarkSpacing.md)
            }
        }
    }
    
    // MARK: - App Info
    private var appInfoSection: some View {
        VStack(spacing: GymMarkSpacing.xs) {
            Text("GymMark")
                .font(GymMarkTypography.body)
                .foregroundColor(GymMarkColors.textSecondary)
            
            Text("Version 1.0.0")
                .font(GymMarkTypography.caption)
                .foregroundColor(GymMarkColors.textTertiary)
        }
        .frame(maxWidth: .infinity)
        .padding(.top, GymMarkSpacing.lg)
    }
}

// MARK: - Settings Row Components
struct SettingsRow<Content: View>: View {
    let title: String
    let content: Content
    
    init(title: String, @ViewBuilder content: () -> Content) {
        self.title = title
        self.content = content()
    }
    
    var body: some View {
        HStack {
            Text(title)
                .font(GymMarkTypography.body)
                .foregroundColor(GymMarkColors.textPrimary)
            
            Spacer()
            
            content
        }
        .padding(.vertical, GymMarkSpacing.xs)
    }
}

struct SettingsToggleRow: View {
    let title: String
    var subtitle: String? = nil
    @Binding var isOn: Bool
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: GymMarkSpacing.xxs) {
                Text(title)
                    .font(GymMarkTypography.body)
                    .foregroundColor(GymMarkColors.textPrimary)
                
                if let subtitle = subtitle {
                    Text(subtitle)
                        .font(GymMarkTypography.caption)
                        .foregroundColor(GymMarkColors.textTertiary)
                }
            }
            
            Spacer()
            
            Toggle("", isOn: $isOn)
                .labelsHidden()
                .tint(GymMarkColors.textPrimary)
        }
        .padding(.vertical, GymMarkSpacing.xs)
    }
}

struct SettingsNavigationRow: View {
    let title: String
    var icon: String? = nil
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack {
                if let icon = icon {
                    Image(systemName: icon)
                        .font(.system(size: 18, weight: .light))
                        .foregroundColor(GymMarkColors.textSecondary)
                        .frame(width: 24)
                }
                
                Text(title)
                    .font(GymMarkTypography.body)
                    .foregroundColor(GymMarkColors.textPrimary)
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(GymMarkColors.textTertiary)
            }
            .padding(.vertical, GymMarkSpacing.xs)
        }
    }
}

// MARK: - Preview
#Preview {
    SettingsView()
}
