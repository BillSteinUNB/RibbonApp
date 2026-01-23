import { useEffect, useRef, useCallback } from 'react';
import { Alert, BackHandler } from 'react-native';
import { useNavigation } from 'expo-router';

interface UseUnsavedChangesOptions {
  /**
   * Whether the form has unsaved changes
   */
  isDirty: boolean;
  /**
   * Title for the confirmation dialog
   */
  title?: string;
  /**
   * Message for the confirmation dialog
   */
  message?: string;
  /**
   * Callback when user confirms they want to leave
   */
  onConfirmLeave?: () => void;
}

/**
 * Hook to warn users when they try to navigate away from a form with unsaved changes.
 * Handles both back button presses and navigation events.
 *
 * @example
 * ```tsx
 * const [formData, setFormData] = useState(initialData);
 * const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);
 *
 * useUnsavedChanges({
 *   isDirty,
 *   onConfirmLeave: () => {
 *     // Optional cleanup before leaving
 *   },
 * });
 * ```
 */
export function useUnsavedChanges({
  isDirty,
  title = 'Discard Changes?',
  message = 'You have unsaved changes. Are you sure you want to leave?',
  onConfirmLeave,
}: UseUnsavedChangesOptions) {
  const navigation = useNavigation();
  const isDirtyRef = useRef(isDirty);

  // Keep ref in sync with isDirty
  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  const showConfirmation = useCallback(
    (onConfirm: () => void, onCancel?: () => void) => {
      Alert.alert(title, message, [
        {
          text: 'Stay',
          style: 'cancel',
          onPress: onCancel,
        },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            onConfirmLeave?.();
            onConfirm();
          },
        },
      ]);
    },
    [title, message, onConfirmLeave]
  );

  // Handle hardware back button on Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isDirtyRef.current) {
        showConfirmation(() => {
          // Allow default back behavior after confirmation
          navigation.goBack();
        });
        return true; // Prevent default back behavior
      }
      return false; // Allow default back behavior
    });

    return () => backHandler.remove();
  }, [navigation, showConfirmation]);

  // Handle navigation events (beforeRemove)
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      if (!isDirtyRef.current) {
        // If no unsaved changes, allow navigation
        return;
      }

      // Prevent default navigation
      e.preventDefault();

      // Show confirmation dialog
      showConfirmation(() => {
        // Continue with the navigation after confirmation
        navigation.dispatch(e.data.action);
      });
    });

    return unsubscribe;
  }, [navigation, showConfirmation]);

  return {
    showConfirmation,
  };
}

/**
 * Simple helper to compare two objects for equality (shallow comparison for form data)
 */
export function hasFormChanged<T extends Record<string, any>>(
  current: T,
  initial: T
): boolean {
  return JSON.stringify(current) !== JSON.stringify(initial);
}
