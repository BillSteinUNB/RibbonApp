//
//  WaveformBackground.swift
//  GymMark - Scientific Minimalism Design System
//
//  Animated waveform and grid background - Signature visual element
//

import SwiftUI

// MARK: - Waveform Background
struct WaveformBackground: View {
    @State private var phase: CGFloat = 0
    var intensity: Double = 1.0 // 0.0 to 1.0, correlates with workout intensity
    
    var body: some View {
        Canvas { context, size in
            // Draw architectural grid
            drawGrid(context: context, size: size)
            
            // Draw crosshair markers at intersections
            drawCrosshairs(context: context, size: size)
            
            // Draw multiple waveform layers
            drawWaveform(
                context: context,
                size: size,
                amplitude: 40 * intensity,
                frequency: 0.8,
                phase: phase,
                opacity: 0.12
            )
            
            drawWaveform(
                context: context,
                size: size,
                amplitude: 25 * intensity,
                frequency: 1.2,
                phase: phase + 0.5,
                opacity: 0.08
            )
            
            drawWaveform(
                context: context,
                size: size,
                amplitude: 60 * intensity,
                frequency: 0.5,
                phase: phase + 1.0,
                opacity: 0.05
            )
        }
        .ignoresSafeArea()
        .onAppear {
            withAnimation(GymMarkAnimation.waveformCycle) {
                phase = .pi * 2
            }
        }
    }
    
    // MARK: - Grid Drawing
    private func drawGrid(context: GraphicsContext, size: CGSize) {
        let spacing = GymMarkSpacing.gridLineSpacing
        let color = GymMarkColors.gridLines
        
        // Vertical lines
        var x: CGFloat = spacing
        while x < size.width {
            var path = Path()
            path.move(to: CGPoint(x: x, y: 0))
            path.addLine(to: CGPoint(x: x, y: size.height))
            context.stroke(path, with: .color(color), lineWidth: 0.5)
            x += spacing
        }
        
        // Horizontal lines
        var y: CGFloat = spacing
        while y < size.height {
            var path = Path()
            path.move(to: CGPoint(x: 0, y: y))
            path.addLine(to: CGPoint(x: size.width, y: y))
            context.stroke(path, with: .color(color), lineWidth: 0.5)
            y += spacing
        }
    }
    
    // MARK: - Crosshair Drawing
    private func drawCrosshairs(context: GraphicsContext, size: CGSize) {
        let spacing = GymMarkSpacing.gridLineSpacing
        let markerSize: CGFloat = 8
        let color = GymMarkColors.crosshairMarker
        
        var x: CGFloat = spacing
        while x < size.width {
            var y: CGFloat = spacing
            while y < size.height {
                // Draw + marker
                var horizontalPath = Path()
                horizontalPath.move(to: CGPoint(x: x - markerSize/2, y: y))
                horizontalPath.addLine(to: CGPoint(x: x + markerSize/2, y: y))
                context.stroke(horizontalPath, with: .color(color), lineWidth: 1)
                
                var verticalPath = Path()
                verticalPath.move(to: CGPoint(x: x, y: y - markerSize/2))
                verticalPath.addLine(to: CGPoint(x: x, y: y + markerSize/2))
                context.stroke(verticalPath, with: .color(color), lineWidth: 1)
                
                y += spacing
            }
            x += spacing
        }
    }
    
    // MARK: - Waveform Drawing
    private func drawWaveform(
        context: GraphicsContext,
        size: CGSize,
        amplitude: CGFloat,
        frequency: CGFloat,
        phase: CGFloat,
        opacity: Double
    ) {
        var path = Path()
        let midY = size.height / 2
        
        path.move(to: CGPoint(x: 0, y: midY))
        
        for x in stride(from: 0, through: size.width, by: 2) {
            let relativeX = x / size.width
            let sine = sin((relativeX * .pi * 2 * frequency) + phase)
            let y = midY + (sine * amplitude)
            path.addLine(to: CGPoint(x: x, y: y))
        }
        
        context.stroke(
            path,
            with: .color(Color.white.opacity(opacity)),
            lineWidth: 1.5
        )
    }
}

// MARK: - Static Waveform Background (No Animation)
struct StaticWaveformBackground: View {
    var body: some View {
        Canvas { context, size in
            // Draw architectural grid
            drawGrid(context: context, size: size)
            
            // Draw crosshair markers
            drawCrosshairs(context: context, size: size)
            
            // Static waveforms
            drawWaveform(context: context, size: size, amplitude: 40, frequency: 0.8, phase: 0, opacity: 0.12)
            drawWaveform(context: context, size: size, amplitude: 25, frequency: 1.2, phase: 0.5, opacity: 0.08)
            drawWaveform(context: context, size: size, amplitude: 60, frequency: 0.5, phase: 1.0, opacity: 0.05)
        }
        .ignoresSafeArea()
    }
    
    private func drawGrid(context: GraphicsContext, size: CGSize) {
        let spacing = GymMarkSpacing.gridLineSpacing
        let color = GymMarkColors.gridLines
        
        var x: CGFloat = spacing
        while x < size.width {
            var path = Path()
            path.move(to: CGPoint(x: x, y: 0))
            path.addLine(to: CGPoint(x: x, y: size.height))
            context.stroke(path, with: .color(color), lineWidth: 0.5)
            x += spacing
        }
        
        var y: CGFloat = spacing
        while y < size.height {
            var path = Path()
            path.move(to: CGPoint(x: 0, y: y))
            path.addLine(to: CGPoint(x: size.width, y: y))
            context.stroke(path, with: .color(color), lineWidth: 0.5)
            y += spacing
        }
    }
    
    private func drawCrosshairs(context: GraphicsContext, size: CGSize) {
        let spacing = GymMarkSpacing.gridLineSpacing
        let markerSize: CGFloat = 8
        let color = GymMarkColors.crosshairMarker
        
        var x: CGFloat = spacing
        while x < size.width {
            var y: CGFloat = spacing
            while y < size.height {
                var horizontalPath = Path()
                horizontalPath.move(to: CGPoint(x: x - markerSize/2, y: y))
                horizontalPath.addLine(to: CGPoint(x: x + markerSize/2, y: y))
                context.stroke(horizontalPath, with: .color(color), lineWidth: 1)
                
                var verticalPath = Path()
                verticalPath.move(to: CGPoint(x: x, y: y - markerSize/2))
                verticalPath.addLine(to: CGPoint(x: x, y: y + markerSize/2))
                context.stroke(verticalPath, with: .color(color), lineWidth: 1)
                
                y += spacing
            }
            x += spacing
        }
    }
    
    private func drawWaveform(
        context: GraphicsContext,
        size: CGSize,
        amplitude: CGFloat,
        frequency: CGFloat,
        phase: CGFloat,
        opacity: Double
    ) {
        var path = Path()
        let midY = size.height / 2
        
        path.move(to: CGPoint(x: 0, y: midY))
        
        for x in stride(from: 0, through: size.width, by: 2) {
            let relativeX = x / size.width
            let sine = sin((relativeX * .pi * 2 * frequency) + phase)
            let y = midY + (sine * amplitude)
            path.addLine(to: CGPoint(x: x, y: y))
        }
        
        context.stroke(
            path,
            with: .color(Color.white.opacity(opacity)),
            lineWidth: 1.5
        )
    }
}

// MARK: - Screen Container
struct ScreenContainer<Content: View>: View {
    let content: Content
    var animated: Bool = true
    
    init(animated: Bool = true, @ViewBuilder content: () -> Content) {
        self.animated = animated
        self.content = content()
    }
    
    var body: some View {
        ZStack {
            // Background
            GymMarkColors.background
                .ignoresSafeArea()
            
            // Waveform layer
            if animated {
                WaveformBackground()
            } else {
                StaticWaveformBackground()
            }
            
            // Content
            content
        }
    }
}

// MARK: - Preview
#Preview("Animated Waveform") {
    ScreenContainer {
        VStack {
            Text("Waveform Background")
                .font(GymMarkTypography.h2)
                .foregroundColor(GymMarkColors.textPrimary)
            
            Text("Animated sine waves with architectural grid")
                .font(GymMarkTypography.body)
                .foregroundColor(GymMarkColors.textSecondary)
        }
    }
}

#Preview("Static Waveform") {
    ScreenContainer(animated: false) {
        VStack {
            Text("Static Background")
                .font(GymMarkTypography.h2)
                .foregroundColor(GymMarkColors.textPrimary)
        }
    }
}
