import React, { useState } from 'react';
import { StyleSheet, Alert, Linking, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import FloatingCallButton from './components/FloatingCallButton';
import { initiateCall } from './services/api.js';

const CALL_DOCK_HEIGHT = 84;

const AppContent = () => {
  const insets = useSafeAreaInsets();
  const [isCalling, setIsCalling] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const callDockHeight = CALL_DOCK_HEIGHT + insets.bottom;

  const handleInitiateCall = async () => {
    if (isCalling) {
      return;
    }

    setIsCalling(true);

    try {
      const response = await initiateCall();

      if (!response.success || !response.phoneNumber) {
        Alert.alert('Call failed', response.error || 'Unable to start call. Please sign in and try again.');
        return;
      }

      const sanitizedNumber = String(response.phoneNumber).replace(/\s+/g, '');
      const dialerUrl = `tel:${sanitizedNumber}`;
      const canOpenDialer = await Linking.canOpenURL(dialerUrl);

      if (!canOpenDialer) {
        Alert.alert('Dialer unavailable', `Please call ${response.phoneNumber} manually.`);
        return;
      }

      Alert.alert('Call ready', `Dialing ${response.phoneNumber} now.`);
      await Linking.openURL(dialerUrl);
    } catch (error) {
      Alert.alert('Call error', error.message || 'Unexpected error while starting the call.');
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.navigatorContainer, isAuthenticated && { paddingBottom: callDockHeight }]}>
        <AppNavigator onAuthStateChange={setIsAuthenticated} />
      </View>

      {isAuthenticated ? (
        <>
          <View style={[styles.callDock, { height: callDockHeight, paddingBottom: insets.bottom }]} pointerEvents="none" />
          <FloatingCallButton onPress={handleInitiateCall} />
        </>
      ) : null}
    </View>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  navigatorContainer: {
    flex: 1
  },
  callDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 20,
    backgroundColor: '#fff'
  }
});
