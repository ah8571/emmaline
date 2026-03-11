import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Animated
} from 'react-native';

/**
 * FloatingCallButton
 * Floating action button for initiating phone calls
 * Appears in the corner of the screen across all tabs
 */
const FloatingCallButton = ({
  onPress,
  statusLabel = null,
  isActiveCall = false,
  isMuted = false,
  audioRoutes = [],
  selectedAudioRoute = null,
  onSelectAudioRoute,
  onToggleMute
}) => {
  const [scaleAnim] = React.useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true
    }).start();
  };

  const handlePress = () => {
    handlePressOut();
    onPress();
  };

  const showAudioRoutes = isActiveCall && (audioRoutes.length > 0 || Boolean(onToggleMute));

  return (
    <>
      {showAudioRoutes ? (
        <View style={styles.audioRouteCard}>
          <View style={styles.callActionRow}>
            <TouchableOpacity
              style={[styles.callActionButton, isMuted && styles.callActionButtonActive]}
              onPress={() => onToggleMute?.()}
              activeOpacity={0.85}
            >
              <Text style={[styles.callActionButtonText, isMuted && styles.callActionButtonTextActive]}>
                {isMuted ? 'Unmute' : 'Mute'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.audioRouteTitle}>Audio</Text>
          <View style={styles.audioRouteList}>
            {audioRoutes.map((route) => {
              const selected = selectedAudioRoute === route.uuid;

              return (
                <TouchableOpacity
                  key={route.uuid}
                  style={[styles.audioRouteChip, selected && styles.audioRouteChipSelected]}
                  onPress={() => onSelectAudioRoute?.(route.uuid)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.audioRouteChipText, selected && styles.audioRouteChipTextSelected]}>
                    {route.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ) : null}

      <Animated.View
        style={[
          styles.floatingContainer,
          {
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <TouchableOpacity
          style={[styles.button, isActiveCall && styles.buttonActive]}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
        >
          <Text style={styles.phoneIcon}>{isActiveCall ? '✕' : '📞'}</Text>
        </TouchableOpacity>
      </Animated.View>

      {statusLabel ? (
        <View style={styles.statusIndicator}>
          <Text style={styles.statusText}>{statusLabel}</Text>
        </View>
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    zIndex: 999
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12
  },
  buttonActive: {
    backgroundColor: '#d9485f'
  },
  phoneIcon: {
    fontSize: 32
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 196,
    right: 20,
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  audioRouteCard: {
    position: 'absolute',
    right: 20,
    bottom: 160,
    width: 220,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8
  },
  audioRouteTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#495057',
    marginBottom: 10
  },
  callActionRow: {
    flexDirection: 'row',
    marginBottom: 12
  },
  callActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#f1f3f5'
  },
  callActionButtonActive: {
    backgroundColor: '#ffe3e3'
  },
  callActionButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#495057'
  },
  callActionButtonTextActive: {
    color: '#c92a2a'
  },
  audioRouteList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  audioRouteChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#f1f3f5'
  },
  audioRouteChipSelected: {
    backgroundColor: '#d9ecff'
  },
  audioRouteChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057'
  },
  audioRouteChipTextSelected: {
    color: '#0056b3'
  }
});

export default FloatingCallButton;
