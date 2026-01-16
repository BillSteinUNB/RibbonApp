import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { errorLogger } from './errorLogger';
import { logger } from '../utils/logger';

// Flag to track if notification handler is set up
let isNotificationHandlerConfigured = false;

// Configure notification behavior - call this function before using notifications
export function configureNotificationHandler() {
  if (isNotificationHandlerConfigured) return;
  
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    isNotificationHandlerConfigured = true;
  } catch (error) {
    logger.error('[Notifications] Failed to configure handler:', error);
  }
}

export const notificationService = {
  registerForPushNotifications: async (): Promise<string | undefined> => {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        logger.warn('Failed to get push token for push notification');
        return;
      }
      
      // In a real app we would get the token and send to backend
      // const token = (await Notifications.getExpoPushTokenAsync()).data;
      // return token;
      return 'mock-push-token';
    } catch (error) {
      errorLogger.log(error, { context: 'registerForPushNotifications' });
      return undefined;
    }
  },

  scheduleOccasionReminder: async (
    recipientName: string, 
    occasion: string, 
    date: Date, 
    daysBefore: number = 3
  ) => {
    const triggerDate = new Date(date);
    triggerDate.setDate(triggerDate.getDate() - daysBefore);
    triggerDate.setHours(10, 0, 0, 0); // 10 AM

    if (triggerDate <= new Date()) return; // Don't schedule in past

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Upcoming Occasion: ${recipientName}`,
        body: `${recipientName}'s ${occasion} is in ${daysBefore} days! Tap to find a gift.`,
        data: { type: 'occasion_reminder' },
      },
      trigger: triggerDate,
    } as any);
  },

  scheduleWeeklyDigest: async () => {
    // Schedule for next Friday at 5 PM
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Weekly Gift Ideas',
        body: 'Check out new trending gifts for your upcoming occasions!',
      },
      trigger: {
        weekday: 6, // Friday
        hour: 17,
        minute: 0,
        repeats: true,
      } as any,
    });
  }
};
