/**
 * ErrorBoundary Component
 *
 * Catches React errors in component tree and displays user-friendly error UI
 * Implements Phase 15 verification - ErrorBoundary exists and catches React errors
 *
 * CRITICAL: NO Sentry imports - uses only local errorLogger
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { errorLogger } from '../services/errorLogger';
import { AppError } from '../types/errors';
import { logger } from '../utils/logger';
import { formatErrorMessage } from '../utils/errorMessages';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary Class Component
 *
 * Wraps the entire app to catch JavaScript errors anywhere in the component tree,
 * log those errors, and display a fallback UI instead of the crashed component tree.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Update state when error is caught
   * Called when any child component throws an error
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Log error to error service when caught
   * Called after state is updated
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log to console for debugging
    logger.error('[ErrorBoundary] Caught error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Log to error logger service (which reports to backend)
    const appError = new AppError(
      error.message || 'Unknown error in component tree',
      'REACT_ERROR',
      undefined,
      {
        componentStack: errorInfo.componentStack,
        stack: error.stack,
      }
    );

    errorLogger.log(appError, {
      source: 'ErrorBoundary',
      componentStack: errorInfo.componentStack,
    });

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (handlerError) {
        logger.error('[ErrorBoundary] Error in onError handler:', handlerError);
      }
    }
  }

  /**
   * Reset error boundary state (allows app to recover)
   */
  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  /**
   * Reload the app
   */
  handleReload = (): void => {
    // Reset error state and reload
    this.handleReset();
    // Note: In React Native, you might want to use Updates.reloadAsync() from expo-updates
    // For now, we just reset the state to allow retry
    logger.info('[ErrorBoundary] App reset requested by user');
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return <ErrorFallback 
        error={this.state.error} 
        errorInfo={this.state.errorInfo}
        onReset={this.handleReset}
        onReload={this.handleReload}
      />;
    }

    return this.props.children;
  }
}

/**
 * Default Error Fallback UI Component
 */
interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
  onReload: () => void;
}

function ErrorFallback({ error, errorInfo, onReset, onReload }: ErrorFallbackProps): React.ReactElement {
  const errorMessage = error ? formatErrorMessage(error) : 'Something went wrong';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Oops!</Text>
        <Text style={styles.message}>
          {errorMessage}
        </Text>

        {__DEV__ && error && (
          <ScrollView style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>Error Details:</Text>
            <Text style={styles.errorText}>
              {error.toString()}
            </Text>
            {errorInfo && (
              <Text style={styles.componentStack}>
                {errorInfo.componentStack}
              </Text>
            )}
          </ScrollView>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.resetButton]}
            onPress={onReset}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.reloadButton]}
            onPress={onReload}
          >
            <Text style={styles.buttonText}>Reset App</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.supportText}>
          If this problem persists, please contact support
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E85D75',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  detailsContainer: {
    maxHeight: 200,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#d32f2f',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  componentStack: {
    fontSize: 10,
    color: '#666',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    backgroundColor: '#E85D75',
  },
  reloadButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  supportText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default ErrorBoundary;
