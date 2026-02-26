import React, { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import AppNavigator from './navigation/AppNavigator';
import FloatingCallButton from './components/FloatingCallButton';

export default function App() {
  const [isCalling, setIsCalling] = useState(false);

  const handleInitiateCall = () => {
    // TODO: Implement phone call initiation
    // 1. Request microphone permission
    // 2. Connect to backend call endpoint
    // 3. Show call UI with real-time transcript
    console.log('Initiating call to AI...');
    setIsCalling(true);

    // Simulate call end after 30 seconds
    setTimeout(() => {
      setIsCalling(false);
    }, 30000);
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
