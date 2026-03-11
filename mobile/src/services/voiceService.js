import { Voice, Call } from '@twilio/voice-react-native-sdk';
import { PermissionsAndroid, Platform } from 'react-native';

let voiceInstance = null;
let activeCall = null;
let audioDeviceState = {
  audioDevices: [],
  selectedDevice: null
};
const audioDeviceListeners = new Set();
let audioDeviceEventsBound = false;

const getVoiceInstance = () => {
  if (!voiceInstance) {
    voiceInstance = new Voice();
  }

  return voiceInstance;
};

const notifyAudioDeviceListeners = () => {
  audioDeviceListeners.forEach((listener) => {
    try {
      listener(audioDeviceState);
    } catch (error) {
      // Ignore listener failures so audio routing remains usable.
    }
  });
};

const updateAudioDeviceState = ({ audioDevices = [], selectedDevice = null } = {}) => {
  audioDeviceState = {
    audioDevices,
    selectedDevice
  };
  notifyAudioDeviceListeners();
};

const handleAudioDevicesUpdated = (audioDevices = [], selectedDevice = null) => {
  updateAudioDeviceState({ audioDevices, selectedDevice });
};

const ensureAudioDeviceEventsBound = () => {
  if (audioDeviceEventsBound) {
    return;
  }

  const voice = getVoiceInstance();
  voice.addListener(Voice.Event.AudioDevicesUpdated, handleAudioDevicesUpdated);
  audioDeviceEventsBound = true;
};

const requestBluetoothAudioPermission = async () => {
  if (Platform.OS !== 'android' || Number(Platform.Version) < 31) {
    return true;
  }

  const bluetoothPermission = PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT;

  if (!bluetoothPermission) {
    return true;
  }

  const hasPermission = await PermissionsAndroid.check(bluetoothPermission);

  if (hasPermission) {
    return true;
  }

  const result = await PermissionsAndroid.request(bluetoothPermission, {
    title: 'Bluetooth access for call audio',
    message: 'Emmaline uses Bluetooth access so you can route VoIP calls to headphones or your car audio.',
    buttonPositive: 'Allow',
    buttonNegative: 'Not now'
  });

  return result === PermissionsAndroid.RESULTS.GRANTED;
};

export const ensureMicrophonePermission = async () => {
  if (Platform.OS !== 'android') {
    return { success: true };
  }

  try {
    const hasPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);

    if (hasPermission) {
      await requestBluetoothAudioPermission();
      return { success: true };
    }

    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: 'Microphone permission required',
        message: 'Emmaline needs microphone access for in-app VoIP calls.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny'
      }
    );

    if (result === PermissionsAndroid.RESULTS.GRANTED) {
      await requestBluetoothAudioPermission();
      return { success: true };
    }

    return {
      success: false,
      error: 'Microphone permission denied'
    };
  } catch (error) {
    return {
      success: false,
      error: error?.message || 'Unable to request microphone permission'
    };
  }
};

export const refreshAudioDevices = async () => {
  try {
    ensureAudioDeviceEventsBound();

    const voice = getVoiceInstance();
    const { audioDevices = [], selectedDevice = null } = await voice.getAudioDevices();

    updateAudioDeviceState({ audioDevices, selectedDevice });
    return {
      success: true,
      ...audioDeviceState
    };
  } catch (error) {
    return {
      success: false,
      error: error?.message || 'Unable to read audio devices',
      ...audioDeviceState
    };
  }
};

export const subscribeToAudioDevices = (listener) => {
  ensureAudioDeviceEventsBound();
  audioDeviceListeners.add(listener);
  listener(audioDeviceState);

  return () => {
    audioDeviceListeners.delete(listener);
  };
};

export const selectAudioDevice = async (deviceIdentifier) => {
  const currentState = audioDeviceState.audioDevices.length > 0
    ? { success: true, ...audioDeviceState }
    : await refreshAudioDevices();

  if (!currentState.success && currentState.audioDevices.length === 0) {
    return {
      success: false,
      error: currentState.error || 'No audio devices available'
    };
  }

  const audioDevice = currentState.audioDevices.find((device) => {
    return device.uuid === deviceIdentifier || device.type === deviceIdentifier;
  });

  if (!audioDevice) {
    return {
      success: false,
      error: 'That audio route is not available right now.'
    };
  }

  try {
    await audioDevice.select();
    await refreshAudioDevices();

    return {
      success: true,
      selectedDevice: audioDeviceState.selectedDevice
    };
  } catch (error) {
    return {
      success: false,
      error: error?.message || 'Unable to switch audio route'
    };
  }
};

export const startVoiceCall = async ({ token, params = {}, onStatusChange, onError }) => {
  if (!token) {
    return {
      success: false,
      error: 'Voice token is required'
    };
  }

  try {
    if (activeCall) {
      return {
        success: false,
        error: 'A call is already active'
      };
    }

    const voice = getVoiceInstance();
    ensureAudioDeviceEventsBound();

    onStatusChange?.('connecting');

    const call = await voice.connect(token, {
      contactHandle: 'Emmaline AI',
      notificationDisplayName: 'Emmaline AI',
      params
    });

    activeCall = call;
    refreshAudioDevices().catch(() => {
      // Best-effort sync for audio routes.
    });

    call.on(Call.Event.Ringing, () => {
      onStatusChange?.('ringing');
    });

    call.on(Call.Event.Connected, () => {
      onStatusChange?.('live');
      refreshAudioDevices().catch(() => {
        // Best-effort sync for audio routes.
      });
    });

    call.on(Call.Event.Reconnecting, () => {
      onStatusChange?.('reconnecting');
    });

    call.on(Call.Event.Reconnected, () => {
      onStatusChange?.('live');
    });

    call.on(Call.Event.ConnectFailure, (error) => {
      activeCall = null;
      updateAudioDeviceState({ audioDevices: [], selectedDevice: null });
      onStatusChange?.('failed');
      onError?.(error?.message || 'Failed to connect call');
    });

    call.on(Call.Event.Disconnected, () => {
      activeCall = null;
      updateAudioDeviceState({ audioDevices: [], selectedDevice: null });
      onStatusChange?.('ended');
    });

    return {
      success: true,
      call
    };
  } catch (error) {
    activeCall = null;
    updateAudioDeviceState({ audioDevices: [], selectedDevice: null });
    onStatusChange?.('failed');

    return {
      success: false,
      error: error?.message || 'Unable to start in-app call'
    };
  }
};

export const endVoiceCall = async () => {
  if (!activeCall) {
    updateAudioDeviceState({ audioDevices: [], selectedDevice: null });
    return {
      success: true
    };
  }

  try {
    await activeCall.disconnect();
    activeCall = null;
    updateAudioDeviceState({ audioDevices: [], selectedDevice: null });

    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: error?.message || 'Unable to end call'
    };
  }
};

export const getVoiceCallActive = () => Boolean(activeCall);

export const getAudioDeviceState = () => audioDeviceState;
