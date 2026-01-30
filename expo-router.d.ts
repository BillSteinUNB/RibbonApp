declare module 'expo-router' {
  import { ComponentType } from 'react';

  export interface StackRouter {
    navigation: any;
  }

  export interface RouterContext {
    navigation: any;
  }

  export function useRouter(): any;
  export function useLocalSearchParams(): any;
  export function useSegments(): string[];
  export function useNavigation(): any;

  type ScreenComponent = ComponentType<any> & { Screen: ComponentType<any> };

  export const Stack: ScreenComponent;
  export const Tabs: ScreenComponent;
  export const Redirect: ComponentType<any>;
  export const useFocusEffect: any;
  export const useNavigationState: any;
}
