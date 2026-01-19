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

  export const Stack: ComponentType<any>;
  export const Tabs: ComponentType<any>;
  export const Redirect: ComponentType<any>;
  export const useFocusEffect: any;
  export const useNavigationState: any;
}
