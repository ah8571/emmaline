import React, { useEffect, useState } from 'react';
import { StyleSheet, Alert, Linking, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import FloatingCallButton from './components/FloatingCallButton';
import { getVoiceToken, initiateCall } from './services/api.js';
import { endVoiceCall, getVoiceCallActive, startVoiceCall } from './services/voiceService.js';

const CALL_DOCK_HEIGHT = 84;

const AppContent = () => {
  const insets = useSafeAreaInsets();
  const [isCalling, setIsCalling] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [callStatus, setCallStatus] = useState('idle');

  const callDockHeight = CALL_DOCK_HEIGHT + insets.bottom;

  useEffect(() => {
    return () => {
      endVoiceCall().catch(() => {
        // Best-effort cleanup on unmount.
      });
    };
  }, []);

  const openDialerFallback = async () => {
    const response = await initiateCall();

    if (!response.success || !response.phoneNumber) {
      Alert.alert('Fallback failed', response.error || 'Unable to start dialer fallback call.');
      return;
    }

    const sanitizedNumber = String(response.phoneNumber).replace(/\s+/g, '');
    const dialerUrl = `tel:${sanitizedNumber}`;
    const canOpenDialer = await Linking.canOpenURL(dialerUrl);

    if (!canOpenDialer) {
      Alert.alert('Dialer unavailable', `Please call ${response.phoneNumber} manually.`);
      return;
    }

    await Linking.openURL(dialerUrl);
  };

  const handleInitiateCall = async () => {
    if (getVoiceCallActive()) {
      const endResponse = await endVoiceCall();
      if (!endResponse.success) {
        Alert.alert('End call failed', endResponse.error || 'Unable to end call.');
        return;
      }

      setIsCalling(false);
      setCallStatus('ended');
      return;
    }

    if (isCalling) {
      return;
    }

    setIsCalling(true);
    setCallStatus('connecting');

    try {
      const tokenResponse = await getVoiceToken();

      if (!tokenResponse.success || !tokenResponse.token) {
        setIsCalling(false);
        setCallStatus('failed');

        Alert.alert(
          'In-app call unavailable',
          tokenResponse.error || 'Unable to get a voice token.',
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Call via phone',
              onPress: () => {
                openDialerFallback().catch((error) => {
                  Alert.alert('Fallback failed', error.message || 'Unable to start fallback call.');
                });
              }
            }
          ]
        );
        return;
      }

      const response = await startVoiceCall({
        token: tokenResponse.token,
        params: {
          identity: tokenResponse.identity || 'unknown'
        },
        onStatusChange: (status) => {
          setCallStatus(status);

          if (status === 'ended' || status === 'failed') {
            setIsCalling(false);
          }
        },
        onError: (message) => {
          Alert.alert('Call error', message || 'Unexpected VoIP call error.');
        }
      });

      if (!response.success) {
        setIsCalling(false);
        setCallStatus('failed');

        Alert.alert(
          'In-app call failed',
          response.error || 'Unable to start in-app call.',
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Call via phone',
              onPress: () => {
                openDialerFallback().catch((error) => {
                  Alert.alert('Fallback failed', error.message || 'Unable to start fallback call.');
                });
              }
            }
          ]
        );
        return;
      }
    } catch (error) {
      setIsCalling(false);
      setCallStatus('failed');
      Alert.alert('Call error', error.message || 'Unexpected error while starting the call.');
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
          <FloatingCallButton
            onPress={handleInitiateCall}
            statusLabel={
              callStatus === 'idle'
                ? null
                : callStatus === 'connecting'
                  ? 'Connecting...'
                  : callStatus === 'ringing'
                    ? 'Ringing...'
                    : callStatus === 'live'
                      ? 'Live'
                      : callStatus === 'reconnecting'
                        ? 'Reconnecting...'
                        : callStatus === 'ended'
                          ? 'Call ended'
                          : 'Call failed'
            }
          />
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
