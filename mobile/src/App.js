import React, { useEffect, useState } from 'react';
import { StyleSheet, Alert, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import FloatingCallButton from './components/FloatingCallButton';
import { getVoiceToken } from './services/api.js';
import {
  endVoiceCall,
  ensureMicrophonePermission,
  getAudioDeviceState,
  getMuteState,
  getVoiceCallActive,
  selectAudioDevice,
  startVoiceCall,
  subscribeToAudioDevices,
  subscribeToMuteState,
  toggleMute
} from './services/voiceService.js';
import {
  getCallResponseDelayPreference,
  getCallLanguagePreference,
  getSpeechRatePreference
} from './utils/secureStorage.js';

const CALL_DOCK_HEIGHT = 26;

const AppContent = () => {
  const insets = useSafeAreaInsets();
  const [isCalling, setIsCalling] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [callStatus, setCallStatus] = useState('idle');
  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState(null);
  const [isMuted, setIsMuted] = useState(false);

  const callDockHeight = CALL_DOCK_HEIGHT + insets.bottom;

  useEffect(() => {
    const unsubscribe = subscribeToAudioDevices(({ audioDevices: nextAudioDevices, selectedDevice }) => {
      setAudioDevices(nextAudioDevices || []);
      setSelectedAudioDevice(selectedDevice || null);
    });

    const currentAudioState = getAudioDeviceState();
    setAudioDevices(currentAudioState.audioDevices || []);
    setSelectedAudioDevice(currentAudioState.selectedDevice || null);

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToMuteState(setIsMuted);
    setIsMuted(getMuteState());
    return unsubscribe;
  }, []);

  useEffect(() => {
    return () => {
      endVoiceCall().catch(() => {
        // Best-effort cleanup on unmount.
      });
    };
  }, []);

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
      const permissionResponse = await ensureMicrophonePermission();

      if (!permissionResponse.success) {
        setIsCalling(false);
        setCallStatus('failed');
        Alert.alert(
          'Microphone permission required',
          permissionResponse.error || 'Please allow microphone access to start an in-app call.'
        );
        return;
      }

      const tokenResponse = await getVoiceToken();
      const [callLanguage, speechRate, callResponseDelayMs] = await Promise.all([
        getCallLanguagePreference(),
        getSpeechRatePreference(),
        getCallResponseDelayPreference()
      ]);

      if (!tokenResponse.success || !tokenResponse.token) {
        setIsCalling(false);
        setCallStatus('failed');

        Alert.alert(
          'In-app call unavailable',
          tokenResponse.error || 'Unable to get a voice token.'
        );
        return;
      }

      const response = await startVoiceCall({
        token: tokenResponse.token,
        params: {
          identity: tokenResponse.identity || 'unknown',
          language: callLanguage || 'en',
          speechRate: String(speechRate || 1),
          responseDelayMs: String(callResponseDelayMs || 1600)
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
          response.error || 'Unable to start in-app call.'
        );
        return;
      }
    } catch (error) {
      setIsCalling(false);
      setCallStatus('failed');
      Alert.alert('Call error', error.message || 'Unexpected error while starting the call.');
    }
  };

  const handleSelectAudioRoute = async (deviceUuid) => {
    const response = await selectAudioDevice(deviceUuid);

    if (!response.success) {
      Alert.alert('Audio route unavailable', response.error || 'Unable to switch the call audio route.');
    }
  };

  const handleToggleMute = async () => {
    const response = await toggleMute();

    if (!response.success) {
      Alert.alert('Mute unavailable', response.error || 'Unable to change mute state.');
    }
  };

  const audioRouteOptions = audioDevices
    .map((device) => ({
      uuid: device.uuid,
      type: device.type,
      label:
        device.type === 'earpiece'
          ? 'Phone'
          : device.type === 'speaker'
            ? 'Speaker'
            : device.type === 'bluetooth'
              ? 'Bluetooth'
              : device.name
    }))
    .sort((left, right) => {
      const order = {
        earpiece: 0,
        speaker: 1,
        bluetooth: 2
      };

      return (order[left.type] ?? 99) - (order[right.type] ?? 99);
    });

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
            isActiveCall={isCalling}
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
            audioRoutes={audioRouteOptions}
            selectedAudioRoute={selectedAudioDevice?.uuid || null}
            onSelectAudioRoute={handleSelectAudioRoute}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
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
