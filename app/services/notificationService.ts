/**
 * Notification Service
 * Handles push notifications and local notifications
 * 
 * CRITICAL: No static imports of native modules - uses dynamic imports.
 */

import { Platform } from 'react-native';
import { errorLogger } from './errorLogger';
import { logger } from '../utils/logger';

type NotificationsModule = typeof import('expo-notifications');

let NotificationsModuleCache: NotificationsModule | null = null;
let isNotificationHandlerConfigured = false;

async function getNotifications(): Promise<NotificationsModule | null> {
  if (NotificationsModuleCache) return NotificationsModuleCache;
  try {
    NotificationsModuleCache = await import('expo-notifications');
    return NotificationsModuleCache;
  } catch (e) {
    console.warn('[Notifications] expo-notifications not available:', e);
    return null;
  }
}

export async function configureNotificationHandler() {
  if (isNotificationHandlerConfigured) return;
  
  try {
    const Notifications = await getNotifications();
    if (!Notifications) return;
    
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
      const Notifications = await getNotifications();
      if (!Notifications) return undefined;
      
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
    try {
      const Notifications = await getNotifications();
      if (!Notifications) return;
      
      const triggerDate = new Date(date);
      triggerDate.setDate(triggerDate.getDate() - daysBefore);
      triggerDate.setHours(10, 0, 0, 0);

      if (triggerDate <= new Date()) return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Upcoming Occasion: ${recipientName}`,
          body: `${recipientName}'s ${occasion} is in ${daysBefore} days! Tap to find a gift.`,
          data: { type: 'occasion_reminder' },
        },
        trigger: triggerDate,
      } as any);
    } catch (error) {
      errorLogger.log(error, { context: 'scheduleOccasionReminder' });
    }
  },

  scheduleWeeklyDigest: async () => {
    try {
      const Notifications = await getNotifications();
      if (!Notifications) return;
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Weekly Gift Ideas',
          body: 'Check out new trending gifts for your upcoming occasions!',
        },
        trigger: {
          weekday: 6,
          hour: 17,
          minute: 0,
          repeats: true,
        } as any,
      });
    } catch (error) {
      errorLogger.log(error, { context: 'scheduleWeeklyDigest' });
    }
  }
};
