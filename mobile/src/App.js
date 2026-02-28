import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Alert, Linking } from 'react-native';
import AppNavigator from './navigation/AppNavigator';
import FloatingCallButton from './components/FloatingCallButton';
import { initiateCall } from './services/api.js';

export default function App() {
  const [isCalling, setIsCalling] = useState(false);

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
    <SafeAreaView style={styles.container}>
      <AppNavigator />
      <FloatingCallButton onPress={handleInitiateCall} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  }
});
