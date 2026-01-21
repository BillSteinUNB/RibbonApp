import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Modal, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SPACING, FONTS, RADIUS } from '../constants';
import { useTheme } from '../hooks/useTheme';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { FormSelect } from '../components/forms';
import { useAuthStore } from '../store/authStore';
import { useRecipientStore } from '../store/recipientStore';
import { useGiftStore } from '../store/giftStore';
import { DEFAULT_PREFERENCES } from '../types/settings';
import { authService } from '../services/authService';
import { CONTACT_INFO } from '../constants/faq';

const PRIVACY_POLICY_URL = 'https://billsteinunb.github.io/RibbonApp/privacy-policy.html';
const TERMS_OF_SERVICE_URL = 'https://billsteinunb.github.io/RibbonApp/terms-of-service.html';

const THEME_OPTIONS = [
  { label: 'Auto', value: 'auto' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

export default function SettingsTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, theme, setTheme } = useTheme();
  const user = useAuthStore(state => state.user);
  const setUser = useAuthStore(state => state.setUser);
  const updateUserPreferences = useAuthStore(state => state.updateUserPreferences);
  const logout = useAuthStore(state => state.logout);
  const setRecipients = useRecipientStore(state => state.setRecipients);
  const setActiveRecipient = useRecipientStore(state => state.setActiveRecipient);
  const resetGifts = useGiftStore(state => state.reset);

  const preferences = useMemo(() => {
    return user?.profile?.preferences || DEFAULT_PREFERENCES;
  }, [user]);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileName, setProfileName] = useState(user?.profile?.name || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const updateNotifications = (updates: Partial<typeof preferences.notifications>) => {
    updateUserPreferences({
      notifications: {
        ...preferences.notifications,
        ...updates,
      },
    });
  };

  const handleThemeChange = (value: string) => {
    if (value !== 'light' && value !== 'dark' && value !== 'auto') return;
    setTheme(value);
    updateUserPreferences({ theme: value });
  };

  const openUrl = async (url: string, fallbackMessage: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert('Unable to open link', fallbackMessage);
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert('Unable to open link', fallbackMessage);
    }
  };

  const handleEditProfile = () => {
    setProfileName(user?.profile?.name || '');
    setIsProfileModalOpen(true);
  };

  const handleSaveProfile = () => {
    if (!user) return;
    setIsSavingProfile(true);
    const trimmedName = profileName.trim();
    setUser({
      ...user,
      profile: {
        ...user.profile,
        name: trimmedName,
      },
    });
    setIsSavingProfile(false);
    setIsProfileModalOpen(false);
  };

  const handleChangePassword = async () => {
    if (!user?.email) {
      Alert.alert('Missing email', 'Please sign in again to reset your password.');
      return;
    }

    setIsPasswordLoading(true);
    try {
      await authService.resetPassword(user.email);
      Alert.alert('Password Reset Sent', `We sent a reset link to ${user.email}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send reset link.';
      Alert.alert('Reset Failed', message);
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleContactSupport = () => {
    const email = CONTACT_INFO.supportEmail || 'support@ribbonapp.com';
    const subject = encodeURIComponent('Ribbon Support');
    const url = `mailto:${email}?subject=${subject}`;
    openUrl(url, `Please email ${email} for support.`);
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          setIsSigningOut(true);
          try {
            await logout();
            resetGifts();
            setRecipients([]);
            setActiveRecipient(null);
          } finally {
            setIsSigningOut(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + SPACING.lg }]}>
      <Text style={styles.title}>Settings</Text>
      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.item} onPress={handleEditProfile}>
            <Text style={styles.itemText}>Edit Profile</Text>
            <Text style={styles.itemValue}>{user?.profile?.name || 'Add name'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.item}
            onPress={handleChangePassword}
            disabled={isPasswordLoading}
          >
            <Text style={styles.itemText}>Change Password</Text>
            <Text style={styles.itemValue}>{isPasswordLoading ? 'Sending...' : 'Email reset link'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.preferenceRow}>
            <Text style={styles.itemText}>Theme</Text>
            <View style={styles.preferenceControl}>
              <FormSelect
                value={theme}
                options={THEME_OPTIONS}
                onSelect={handleThemeChange}
              />
            </View>
          </View>

          <View style={styles.preferenceBlock}>
            <Text style={styles.preferenceTitle}>Notifications</Text>
            <View style={styles.switchRow}>
              <Text style={styles.itemText}>Push Notifications</Text>
              <Switch
                value={preferences.notifications.pushNotifications}
                onValueChange={(value) => updateNotifications({ pushNotifications: value })}
                thumbColor={preferences.notifications.pushNotifications ? colors.accentPrimary : '#D1D5DB'}
                trackColor={{ true: colors.accentSoft, false: '#E5E7EB' }}
              />
            </View>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <TouchableOpacity style={styles.item} onPress={handleContactSupport}>
            <Text style={styles.itemText}>Contact Support</Text>
            <Text style={styles.itemValue}>{CONTACT_INFO.supportEmail}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.item}
            onPress={() => openUrl(PRIVACY_POLICY_URL, 'Privacy policy link is unavailable.')}
          >
            <Text style={styles.itemText}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.item}
            onPress={() => openUrl(TERMS_OF_SERVICE_URL, 'Terms of service link is unavailable.')}
          >
            <Text style={styles.itemText}>Terms of Service</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.signOutContainer}>
          <Button
            title={isSigningOut ? 'Signing Out...' : 'Sign Out'}
            onPress={handleSignOut}
            variant="outline"
            disabled={isSigningOut}
          />
        </View>
      </ScrollView>

      <Modal
        visible={isProfileModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsProfileModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <Input
              label="Name"
              value={profileName}
              onChangeText={setProfileName}
              placeholder="Your name"
              autoCapitalize="words"
            />
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setIsProfileModalOpen(false)}
                variant="outline"
              />
              <Button
                title={isSavingProfile ? 'Saving...' : 'Save'}
                onPress={handleSaveProfile}
                disabled={isSavingProfile}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof import('../hooks/useTheme').useTheme>['colors']) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
    padding: SPACING.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: SPACING.xl,
    fontFamily: FONTS.display,
  },
  section: {
    marginBottom: SPACING.xl,
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    padding: SPACING.md,
    letterSpacing: 0.5,
    fontFamily: FONTS.body,
  },
  item: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontFamily: FONTS.body,
  },
  itemValue: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: FONTS.body,
  },
  preferenceRow: {
    padding: SPACING.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  preferenceControl: {
    marginTop: SPACING.sm,
  },
  preferenceBlock: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  preferenceTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: SPACING.sm,
    fontFamily: FONTS.body,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  signOutContainer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  modalContent: {
    backgroundColor: colors.bgSecondary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: SPACING.md,
    fontFamily: FONTS.display,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
});
