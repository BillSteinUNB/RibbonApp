//
//  LogWeightView.swift
//  GymMark - Scientific Minimalism Design System
//
//  Manual weight and calorie entry form
//

import SwiftUI

struct LogWeightView: View {
    @State private var appeared = false
    @State private var selectedDate = Date()
    @State private var weight = ""
    @State private var calories = ""
    @State private var notes = ""
    @State private var showDatePicker = false
    
    var onSave: () -> Void = {}
    var onCancel: () -> Void = {}
    
    private var isFormValid: Bool {
        !weight.isEmpty
    }
    
    private var dateFormatter: DateFormatter {
        let formatter = DateFormatter()
        formatter.dateStyle = .long
        return formatter
    }
    
    var body: some View {
        ScreenContainer {
            VStack(spacing: 0) {
                // Header
                NavigationHeader(
                    title: "Log Weight",
                    showBackButton: true,
                    backAction: onCancel
                )
                
                ScrollView(showsIndicators: false) {
                    VStack(spacing: GymMarkSpacing.lg) {
                        // Date selector
                        dateSection
                            .opacity(appeared ? 1 : 0)
                            .animation(.easeOut(duration: 0.5), value: appeared)
                        
                        // Weight input
                        weightSection
                            .opacity(appeared ? 1 : 0)
                            .animation(.easeOut(duration: 0.5).delay(0.1), value: appeared)
                        
                        // Calories input (optional)
                        caloriesSection
                            .opacity(appeared ? 1 : 0)
                            .animation(.easeOut(duration: 0.5).delay(0.2), value: appeared)
                        
                        // Notes
                        notesSection
                            .opacity(appeared ? 1 : 0)
                            .animation(.easeOut(duration: 0.5).delay(0.3), value: appeared)
                    }
                    .padding(.horizontal, GymMarkSpacing.screenHorizontal)
                    .padding(.top, GymMarkSpacing.lg)
                }
                
                // Save button
                FilledButton(
                    title: "Save Entry",
                    action: onSave,
                    disabled: !isFormValid
                )
                .padding(.horizontal, GymMarkSpacing.screenHorizontal)
                .padding(.vertical, GymMarkSpacing.md)
            }
        }
        .onAppear {
            appeared = true
        }
    }
    
    // MARK: - Date Section
    private var dateSection: some View {
        VStack(alignment: .leading, spacing: GymMarkSpacing.xs) {
            Text("Date")
                .labelStyle()
            
            Button {
                withAnimation {
                    showDatePicker.toggle()
                }
            } label: {
                HStack {
                    Image(systemName: "calendar")
                        .font(.system(size: 18, weight: .light))
                        .foregroundColor(GymMarkColors.textSecondary)
                    
                    Text(dateFormatter.string(from: selectedDate))
                        .font(GymMarkTypography.body)
                        .foregroundColor(GymMarkColors.textPrimary)
                    
                    Spacer()
                    
                    Image(systemName: showDatePicker ? "chevron.up" : "chevron.down")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(GymMarkColors.textTertiary)
                }
                .padding(GymMarkSpacing.md)
                .background(
                    RoundedRectangle(cornerRadius: GymMarkSpacing.inputRadius)
                        .fill(GymMarkColors.inputBackground)
                        .overlay(
                            RoundedRectangle(cornerRadius: GymMarkSpacing.inputRadius)
                                .stroke(GymMarkColors.cardBorder, lineWidth: 1)
                        )
                )
            }
            
            if showDatePicker {
                DatePicker(
                    "",
                    selection: $selectedDate,
                    displayedComponents: .date
                )
                .datePickerStyle(.graphical)
                .tint(GymMarkColors.textPrimary)
                .colorScheme(.dark)
                .gymMarkCard()
            }
        }
    }
    
    // MARK: - Weight Section
    private var weightSection: some View {
        VStack(alignment: .leading, spacing: GymMarkSpacing.xs) {
            HStack(spacing: GymMarkSpacing.xxs) {
                Text("Weight")
                    .labelStyle()
                Text("*")
                    .font(GymMarkTypography.label)
                    .foregroundColor(GymMarkColors.danger)
            }
            
            HStack {
                Image(systemName: "scalemass")
                    .font(.system(size: 18, weight: .light))
                    .foregroundColor(GymMarkColors.textSecondary)
                
                TextField("", text: $weight)
                    .font(GymMarkTypography.dataSmall)
                    .foregroundColor(GymMarkColors.textPrimary)
                    .keyboardType(.decimalPad)
                
                Spacer()
                
                Text("lbs")
                    .font(GymMarkTypography.body)
                    .foregroundColor(GymMarkColors.textTertiary)
            }
            .padding(GymMarkSpacing.md)
            .background(
                RoundedRectangle(cornerRadius: GymMarkSpacing.inputRadius)
                    .fill(GymMarkColors.inputBackground)
                    .overlay(
                        RoundedRectangle(cornerRadius: GymMarkSpacing.inputRadius)
                            .stroke(GymMarkColors.cardBorder, lineWidth: 1)
                    )
            )
        }
    }
    
    // MARK: - Calories Section
    private var caloriesSection: some View {
        VStack(alignment: .leading, spacing: GymMarkSpacing.xs) {
            Text("Calories")
                .labelStyle()
            
            HStack {
                Image(systemName: "flame")
                    .font(.system(size: 18, weight: .light))
                    .foregroundColor(GymMarkColors.textSecondary)
                
                TextField("", text: $calories, prompt: Text("Optional").foregroundColor(GymMarkColors.textTertiary))
                    .font(GymMarkTypography.dataSmall)
                    .foregroundColor(GymMarkColors.textPrimary)
                    .keyboardType(.numberPad)
                
                Spacer()
                
                Text("cal")
                    .font(GymMarkTypography.body)
                    .foregroundColor(GymMarkColors.textTertiary)
            }
            .padding(GymMarkSpacing.md)
            .background(
                RoundedRectangle(cornerRadius: GymMarkSpacing.inputRadius)
                    .fill(GymMarkColors.inputBackground)
                    .overlay(
                        RoundedRectangle(cornerRadius: GymMarkSpacing.inputRadius)
                            .stroke(GymMarkColors.cardBorder, lineWidth: 1)
                    )
            )
        }
    }
    
    // MARK: - Notes Section
    private var notesSection: some View {
        VStack(alignment: .leading, spacing: GymMarkSpacing.xs) {
            Text("Notes")
                .labelStyle()
            
            GymMarkTextArea(
                placeholder: "Add notes about your weigh-in...",
                text: $notes
            )
        }
    }
}

// MARK: - Preview
#Preview {
    LogWeightView()
}
