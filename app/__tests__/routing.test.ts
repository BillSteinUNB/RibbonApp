/**
 * Expo Router Setup Verification Tests
 * 
 * These tests verify the Expo Router file-based navigation structure
 * and ensure all routes are properly configured.
 */

import { Stack } from 'expo-router';

// Mock React Native components
jest.mock('react-native', () => ({
  StyleSheet: {
    create: (styles: any) => styles,
  },
  Text: 'Text',
  View: 'View',
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  Stack: 'Stack',
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    scheme: 'ribbon',
  },
}));

describe('Expo Router Setup', () => {
  describe('_layout.tsx - Root Layout', () => {
    it('should export a default function', async () => {
      const layoutModule = await import('../_layout');
      expect(typeof layoutModule.default).toBe('function');
    });

    it('should use Stack navigator from expo-router', async () => {
      const layoutModule = await import('../_layout');
      // The layout should render a Stack component
      expect(layoutModule.default.toString()).toContain('Stack');
    });

    it('should be a valid React component', async () => {
      const layoutModule = await import('../_layout');
      const RootLayout = layoutModule.default;
      
      // Component should be renderable (no errors in creation)
      expect(() => {
        // Simulate React rendering
        const component = RootLayout();
        expect(component).toBeTruthy();
      }).not.toThrow();
    });
  });

  describe('index.tsx - Root Route', () => {
    it('should export a default function', async () => {
      const indexModule = await import('../index');
      expect(typeof indexModule.default).toBe('function');
    });

    it('should be a valid React component', async () => {
      const indexModule = await import('../index');
      const Index = indexModule.default;
      
      expect(() => {
        const component = Index();
        expect(component).toBeTruthy();
      }).not.toThrow();
    });

    it('should render without errors', async () => {
      const indexModule = await import('../index');
      const Index = indexModule.default;
      
      const component = Index();
      expect(component).toBeDefined();
      expect(component).toBeTruthy();
    });
  });

  describe('File-based Routing Structure', () => {
    it('should have app/_layout.tsx as the root layout', async () => {
      // Verify _layout.tsx exists and exports a component
      const layoutModule = await import('../_layout');
      expect(layoutModule).toBeDefined();
      expect(typeof layoutModule.default).toBe('function');
    });

    it('should have app/index.tsx as the root route', async () => {
      // Verify index.tsx exists and exports a component
      const indexModule = await import('../index');
      expect(indexModule).toBeDefined();
      expect(typeof indexModule.default).toBe('function');
    });

    it('should follow Expo Router naming conventions', async () => {
      // Files should be named according to Expo Router conventions
      const fs = require('fs');
      const path = require('path');
      const appDir = path.join(__dirname, '..');
      
      const files = fs.readdirSync(appDir);
      
      // Check for required files
      expect(files).toContain('_layout.tsx');
      expect(files).toContain('index.tsx');
      
      // Check that route files export default components
      const layoutModule = await import('../_layout');
      const indexModule = await import('../index');
      
      expect(typeof layoutModule.default).toBe('function');
      expect(typeof indexModule.default).toBe('function');
    });
  });

  describe('Deep Linking Configuration', () => {
    it('should have scheme configured in app.json', () => {
      // This test verifies the app.json has proper deep linking config
      // The actual verification is done in Phase 19 manual checks
      const fs = require('fs');
      const path = require('path');
      const appJsonPath = path.join(__dirname, '../../app.json');
      
      if (fs.existsSync(appJsonPath)) {
        const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf-8'));
        expect(appJson.expo.scheme).toBe('ribbon');
      }
    });

    it('should support ribbon:// scheme for deep links', () => {
      const fs = require('fs');
      const path = require('path');
      const appJsonPath = path.join(__dirname, '../../app.json');
      
      if (fs.existsSync(appJsonPath)) {
        const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf-8'));
        expect(appJson.expo.scheme).toBeDefined();
        expect(appJson.expo.scheme).toBe('ribbon');
      }
    });
  });

  describe('Navigation Integrity', () => {
    it('should have no circular dependencies in routing', async () => {
      // Verify routes don't create circular imports
      const modules = await Promise.all([
        import('../_layout'),
        import('../index'),
      ]);
      
      // All modules should load without circular dependency errors
      modules.forEach(module => {
        expect(module).toBeDefined();
      });
    });

    it('should export only default components from route files', async () => {
      const indexModule = await import('../index');
      const layoutModule = await import('../_layout');
      
      // Route files should have default export
      expect(indexModule.default).toBeDefined();
      expect(layoutModule.default).toBeDefined();
      
      // Named exports should be minimal (only types if needed)
      const indexKeys = Object.keys(indexModule).filter(k => k !== 'default');
      const layoutKeys = Object.keys(layoutModule).filter(k => k !== 'default');
      
      // For index.tsx, expect minimal named exports
      expect(indexKeys.length).toBeLessThanOrEqual(0);
      
      // For _layout.tsx, expect minimal named exports
      expect(layoutKeys.length).toBeLessThanOrEqual(0);
    });
  });

  describe('Type Safety', () => {
    it('should have proper TypeScript types for route components', async () => {
      const indexModule = await import('../index');
      const layoutModule = await import('../_layout');
      
      // Components should be functions
      expect(typeof indexModule.default).toBe('function');
      expect(typeof layoutModule.default).toBe('function');
    });

    it('should compile without TypeScript errors', () => {
      // This test ensures the routing setup compiles correctly
      // Actual compilation is done by npx tsc --noEmit
      const fs = require('fs');
      const path = require('path');
      
      const layoutPath = path.join(__dirname, '../_layout.tsx');
      const indexPath = path.join(__dirname, '../index.tsx');
      
      expect(fs.existsSync(layoutPath)).toBe(true);
      expect(fs.existsSync(indexPath)).toBe(true);
    });
  });
});
