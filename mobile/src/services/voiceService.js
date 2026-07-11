import { Audio } from 'expo-av';
import { Platform } from 'react-native';

const OPENAI_REALTIME_PROVIDER = 'openai-realtime';

export const ensureMicrophonePermission = async () => {
  try {
    if (Platform.OS === 'ios') {
      const permission = await Audio.requestPermissionsAsync();

      if (permission.granted) {
        return { success: true };
      }

      return {
        success: false,
        error: 'Microphone permission denied'
      };
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error?.message || 'Unable to request microphone permission'
    };
  }
};

export const startVoiceCall = async ({ session = null, token = '', params = {}, onStatusChange, onError, onTrace }) => {
  onStatusChange?.('failed');
  return {
    success: false,
    error: 'Live calls are no longer supported. Emmaline has transitioned to provider-neutral voice mode.'
  };
};

export const endVoiceCall = async () => {
  return { success: true };
};

export const getVoiceCallActive = () => false;

export const getAudioDeviceState = () => ({
  audioDevices: [],
  selectedDevice: null
});

export const getMuteState = () => false;

export const refreshAudioDevices = async () => ({
  success: true,
  audioDevices: [],
  selectedDevice: null
});

export const selectAudioDevice = async () => ({
  success: true,
  selectedDevice: null
});

export const subscribeToAudioDevices = (listener) => {
  listener({
    audioDevices: [],
    selectedDevice: null
  });
  return () => {};
};

export const subscribeToMuteState = (listener) => {
  listener(false);
  return () => {};
};

export const toggleMute = async () => ({
  success: true,
  isMuted: false
});
