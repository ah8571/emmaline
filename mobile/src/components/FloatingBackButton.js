import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../theme/appTheme.js';

const FloatingBackButton = ({ onPress, topOffset = 0, leftOffset = 8 }) => {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const floatingTop = Math.max(insets.top - 12, 0) + topOffset;

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.container,
        {
          top: floatingTop,
          left: leftOffset
        }
      ]}
    >
      <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.75}>
        <Ionicons name="chevron-back" size={30} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 40
  },
  button: {
    minWidth: 36,
    minHeight: 36,
    alignItems: 'flex-start',
    justifyContent: 'center'
  }
});

export default FloatingBackButton;