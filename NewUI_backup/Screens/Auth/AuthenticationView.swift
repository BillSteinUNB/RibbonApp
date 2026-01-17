//
//  AuthenticationView.swift
//  GymMark - Scientific Minimalism Design System
//
//  Sign in / Sign up flows
//

import SwiftUI
import AuthenticationServices

struct AuthenticationView: View {
    @State private var appeared = false
    
    var onAppleSignIn: () -> Void = {}
    var onGoogleSignIn: () -> Void = {}
    var onEmailSignIn: () -> Void = {}
    var onGuestContinue: () -> Void = {}
    
    var body: some View {
        ScreenContainer {
            VStack(spacing: 0) {
                Spacer()
                
                // Logo and branding
                VStack(spacing: GymMarkSpacing.lg) {
                    AppLogoIcon(size: 100)
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 20)
                        .animation(.easeOut(duration: 0.6), value: appeared)
                    
                    Text("GymMark")
                        .font(GymMarkTypography.h1)
                        .tracking(-1.5)
                        .foregroundColor(GymMarkColors.textPrimary)
                        .opacity(appeared ? 1 : 0)
                        .animation(.easeOut(duration: 0.6).delay(0.1), value: appeared)
                }
                
                Spacer()
                
                // Sign in buttons
                VStack(spacing: GymMarkSpacing.md) {
                    // Sign in with Apple
                    SignInWithAppleButton(.signIn) { request in
                        request.requestedScopes = [.fullName, .email]
                    } onCompletion: { result in
                        switch result {
                        case .success:
                            onAppleSignIn()
                        case .failure(let error):
                            print("Sign in with Apple failed: \(error)")
                        }
                    }
                    .signInWithAppleButtonStyle(.white)
                    .frame(height: GymMarkSpacing.buttonHeight)
                    .cornerRadius(GymMarkSpacing.buttonRadius)
                    .opacity(appeared ? 1 : 0)
                    .animation(.easeOut(duration: 0.5).delay(0.2), value: appeared)
                    
                    // Sign in with Google
                    AuthButton(
                        title: "Sign in with Google",
                        icon: "g.circle.fill",
                        action: onGoogleSignIn
                    )
                    .opacity(appeared ? 1 : 0)
                    .animation(.easeOut(duration: 0.5).delay(0.25), value: appeared)
                    
                    // Sign in with Email
                    AuthButton(
                        title: "Sign in with Email",
                        icon: "envelope",
                        action: onEmailSignIn
                    )
                    .opacity(appeared ? 1 : 0)
                    .animation(.easeOut(duration: 0.5).delay(0.3), value: appeared)
                    
                    // Continue as Guest
                    Button(action: onGuestContinue) {
                        Text("Continue as Guest")
                            .font(GymMarkTypography.buttonSecondary)
                            .foregroundColor(GymMarkColors.textTertiary)
                            .frame(maxWidth: .infinity)
                            .frame(height: GymMarkSpacing.buttonHeight)
                    }
                    .opacity(appeared ? 1 : 0)
                    .animation(.easeOut(duration: 0.5).delay(0.35), value: appeared)
                }
                .padding(.horizontal, GymMarkSpacing.screenHorizontal)
                .padding(.bottom, GymMarkSpacing.xxl)
            }
        }
        .onAppear {
            appeared = true
        }
    }
}

// MARK: - Auth Button
struct AuthButton: View {
    let title: String
    let icon: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: GymMarkSpacing.iconTextGap) {
                Image(systemName: icon)
                    .font(.system(size: 18, weight: .medium))
                
                Text(title)
                    .font(GymMarkTypography.buttonPrimary)
            }
            .foregroundColor(GymMarkColors.textPrimary)
            .frame(maxWidth: .infinity)
            .frame(height: GymMarkSpacing.buttonHeight)
            .background(
                RoundedRectangle(cornerRadius: GymMarkSpacing.buttonRadius)
                    .stroke(GymMarkColors.buttonOutline, lineWidth: 1.5)
            )
        }
    }
}

// MARK: - Preview
#Preview {
    AuthenticationView()
}
