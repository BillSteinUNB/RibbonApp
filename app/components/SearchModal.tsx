import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Modal, TextInput, TouchableOpacity, TouchableWithoutFeedback, Animated, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { X, Search as SearchIcon } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants';

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  initialQuery?: string;
  placeholder?: string;
}

export default function SearchModal({ visible, onClose, onSearch, initialQuery = '', placeholder = 'Search...' }: SearchModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const [showClear, setShowClear] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setQuery(initialQuery);
    setShowClear(initialQuery.length > 0);
  }, [initialQuery, visible]);

  useEffect(() => {
    setShowClear(query.length > 0);
  }, [query]);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const handleClose = () => {
    Keyboard.dismiss();
    onClose();
  };

  const handleClear = () => {
    setQuery('');
    setShowClear(false);
    onSearch('');
  };

  const handleSearchInput = (text: string) => {
    setQuery(text);
    onSearch(text);
  };

  const backdropOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  const modalScale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  const handleBackdropPress = () => {
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardContainer}
          >
            <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
              <Animated.View style={[styles.modalContainer, { transform: [{ scale: modalScale }] }]}>
                <View style={styles.searchInputContainer}>
                  <SearchIcon size={20} color={COLORS.textMuted} />
                  
                  <TextInput
                    ref={inputRef}
                    style={styles.searchInput}
                    value={query}
                    onChangeText={handleSearchInput}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.textMuted}
                    autoFocus
                    autoCapitalize="none"
                    returnKeyType="search"
                    onSubmitEditing={handleClose}
                  />
                  
                  {showClear && (
                    <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                      <X size={20} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity onPress={handleClose} style={styles.cancelButton}>
                  <View style={styles.cancelButtonContent}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#000',
  },
  keyboardContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  modalContainer: {
    backgroundColor: 'white',
    marginHorizontal: SPACING.md,
    marginTop: Platform.OS === 'ios' ? 80 : 40,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgSubtle,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: 16,
    color: COLORS.textPrimary,
    fontFamily: FONTS.body,
    marginLeft: SPACING.sm,
  },
  clearButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  cancelButton: {
    alignSelf: 'flex-start',
  },
  cancelButtonContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.accentPrimary,
    fontFamily: FONTS.body,
  },
});
