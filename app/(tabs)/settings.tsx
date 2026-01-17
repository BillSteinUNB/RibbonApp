import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Bell, Shield, CircleHelp as HelpCircle, LogOut, ChevronRight, CreditCard, FileText, BarChart3, Crown, RefreshCw } from 'lucide-react-native';
import { useAuthStore, selectUser, selectUserPreferences } from '../store/authStore';
import { subscriptionService } from '../services/subscriptionService';
import { LEGAL_CONFIG } from '../config/app.config';
import { biometricAuthService } from '../services/biometricAuthService';
import { getAnalyticsConsent, setAnalyticsConsent, clearAnalyticsData } from '../utils/analytics';


export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout, updateUserPreferences, setSubscription } = useAuthStore();
  const preferences = user?.profile?.preferences;
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    // Load analytics consent on mount
    getAnalyticsConsent().then(consent => {
      setAnalyticsEnabled(consent.enabled);
    });
  }, []);

  const toggleAnalytics = async (value: boolean) => {
    setAnalyticsEnabled(value);
    await setAnalyticsConsent(value);
    updateUserPreferences({
      analytics: {
        enabled: value,
        consentGiven: value,
        consentDate: value ? new Date().toISOString() : undefined,
      }
    });
  };

  const handleClearAnalyticsData = () => {
    Alert.alert(
      'Clear Analytics Data',
      'This will delete all collected analytics data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            await clearAnalyticsData();
            setAnalyticsEnabled(false);
            Alert.alert('Success', 'Analytics data has been cleared.');
          }
        }
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            // Check if biometric is enabled and available
            const biometricEnabled = await biometricAuthService.isBiometricEnabled();
            const biometricAvailable = await biometricAuthService.checkAvailability();

            if (biometricEnabled && biometricAvailable) {
              // Require biometric authentication before logout
              const authenticated = await biometricAuthService.authenticate('Authenticate to sign out');
              if (!authenticated) {
                Alert.alert('Authentication Required', 'Biometric authentication is required to sign out.');
                return;
              }
            }

            logout();
            router.replace('/(auth)/sign-in');
          }
        }
      ]
    );
  };

  const toggleNotification = (key: any) => {
    // @ts-ignore
    if (!preferences?.notifications) return;
    updateUserPreferences({
      notifications: {
        // @ts-ignore
        ...preferences.notifications,
        // @ts-ignore
        [key]: !preferences.notifications[key]
      }
    });
  };

  const openPrivacyPolicy = async () => {
    try {
      await Linking.openURL(LEGAL_CONFIG.privacyPolicyUrl);
    } catch (error) {
      Alert.alert('Error', 'Could not open Privacy Policy');
    }
  };

  const openTermsOfService = async () => {
    try {
      await Linking.openURL(LEGAL_CONFIG.termsOfServiceUrl);
    } catch (error) {
      Alert.alert('Error', 'Could not open Terms of Service');
    }
  };

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Text>Please sign in to view settings</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.email?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.name}>{user.profile?.name || 'User'}</Text>
        <Text style={styles.email}>{user.email}</Text>
        {user.isPremium ? (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>Pro Member</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.upgradeButton}
            onPress={() => router.push('/pricing')}
          >
            <Text style={styles.upgradeText}>Upgrade to Pro</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription</Text>
        {user.isPremium ? (
          <>
            <TouchableOpacity
              style={styles.row}
              onPress={() => subscriptionService.openCustomerCenter()}
            >
              <View style={styles.rowLeft}>
                {/* @ts-ignore */}
                <CreditCard size={22} color="#6B7280" />
                <Text style={styles.rowLabel}>Manage Subscription</Text>
              </View>
              {/* @ts-ignore */}
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.row}
              onPress={async () => {
                try {
                  const subscription = await subscriptionService.restorePurchases(user.id);
                  if (subscription) {
                    Alert.alert('Success', 'Purchases restored successfully');
                  } else {
                    Alert.alert('Info', 'No additional purchases found');
                  }
                } catch (error) {
                  Alert.alert('Error', 'Failed to restore purchases. Please try again.');
                }
              }}
            >
              <View style={styles.rowLeft}>
                <RefreshCw size={22} color="#6B7280" />
                <Text style={styles.rowLabel}>Restore Purchases</Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.row}
              onPress={() => router.push('/pricing')}
            >
              <View style={styles.rowLeft}>
                <Crown size={22} color="#FF4B4B" />
                <Text style={[styles.rowLabel, { color: '#FF4B4B' }]}>Upgrade to Pro</Text>
              </View>
              <ChevronRight size={20} color="#FF4B4B" />
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            {/* @ts-ignore */}
            <Bell size={22} color="#6B7280" />
            <Text style={styles.rowLabel}>Occasion Reminders</Text>
          </View>
          <Switch 
            value={preferences?.notifications?.occasionReminders}
            onValueChange={() => toggleNotification('occasionReminders')}
            trackColor={{ false: '#D1D5DB', true: '#FF4B4B' }}
          />
        </View>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            {/* @ts-ignore */}
            <Bell size={22} color="#6B7280" />
            <Text style={styles.rowLabel}>Weekly Digest</Text>
          </View>
          <Switch
            value={preferences?.notifications?.weeklyDigest}
            onValueChange={() => toggleNotification('weeklyDigest')}
            trackColor={{ false: '#D1D5DB', true: '#FF4B4B' }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            {/* @ts-ignore */}
            <BarChart3 size={22} color="#6B7280" />
            <Text style={styles.rowLabel}>Analytics</Text>
          </View>
          <Switch
            value={analyticsEnabled}
            onValueChange={toggleAnalytics}
            trackColor={{ false: '#D1D5DB', true: '#FF4B4B' }}
          />
        </View>
        <TouchableOpacity style={styles.row} onPress={handleClearAnalyticsData}>
          <View style={styles.rowLeft}>
            {/* @ts-ignore */}
            <Shield size={22} color="#6B7280" />
            <Text style={styles.rowLabel}>Clear Analytics Data</Text>
          </View>
          {/* @ts-ignore */}
          <ChevronRight size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <TouchableOpacity style={styles.row} onPress={() => router.push('/help')}>
          <View style={styles.rowLeft}>
            {/* @ts-ignore */}
            <HelpCircle size={22} color="#6B7280" />
            <Text style={styles.rowLabel}>Help Center</Text>
          </View>
          {/* @ts-ignore */}
          <ChevronRight size={20} color="#9CA3AF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={openPrivacyPolicy}>
          <View style={styles.rowLeft}>
            {/* @ts-ignore */}
            <Shield size={22} color="#6B7280" />
            <Text style={styles.rowLabel}>Privacy Policy</Text>
          </View>
          {/* @ts-ignore */}
          <ChevronRight size={20} color="#9CA3AF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={openTermsOfService}>
          <View style={styles.rowLeft}>
            {/* @ts-ignore */}
            <FileText size={22} color="#6B7280" />
            <Text style={styles.rowLabel}>Terms of Service</Text>
          </View>
          {/* @ts-ignore */}
          <ChevronRight size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.row, styles.logoutRow]}
        onPress={handleLogout}
      >
        <View style={styles.rowLeft}>
          {/* @ts-ignore */}
          <LogOut size={22} color="#EF4444" />
          <Text style={[styles.rowLabel, styles.logoutText]}>Sign Out</Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.version}>Version 1.0.0 (Build 100)</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: 'white',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#374151',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  premiumBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  premiumText: {
    color: '#059669',
    fontWeight: '600',
    fontSize: 12,
  },
  upgradeButton: {
    backgroundColor: '#FF4B4B',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  upgradeText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    backgroundColor: 'white',
    marginTop: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#F3F4F6',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
  },
  logoutRow: {
    marginTop: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  logoutText: {
    color: '#EF4444',
  },
  version: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 12,
    marginVertical: 24,
  },
});
