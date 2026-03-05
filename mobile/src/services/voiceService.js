import { Voice, Call } from '@twilio/voice-react-native-sdk';

let voiceInstance = null;
let activeCall = null;

const getVoiceInstance = () => {
  if (!voiceInstance) {
    voiceInstance = new Voice();
  }

  return voiceInstance;
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

    onStatusChange?.('connecting');

    const call = await voice.connect(token, {
      contactHandle: 'Emmaline AI',
      notificationDisplayName: 'Emmaline AI',
      params
    });

    activeCall = call;

    call.on(Call.Event.Ringing, () => {
      onStatusChange?.('ringing');
    });

    call.on(Call.Event.Connected, () => {
      onStatusChange?.('live');
    });

    call.on(Call.Event.Reconnecting, () => {
      onStatusChange?.('reconnecting');
    });

    call.on(Call.Event.Reconnected, () => {
      onStatusChange?.('live');
    });

    call.on(Call.Event.ConnectFailure, (error) => {
      activeCall = null;
      onStatusChange?.('failed');
      onError?.(error?.message || 'Failed to connect call');
    });

    call.on(Call.Event.Disconnected, () => {
      activeCall = null;
      onStatusChange?.('ended');
    });

    return {
      success: true,
      call
    };
  } catch (error) {
    activeCall = null;
    onStatusChange?.('failed');

    return {
      success: false,
      error: error?.message || 'Unable to start in-app call'
    };
  }
};

export const endVoiceCall = async () => {
  if (!activeCall) {
    return {
      success: true
    };
  }

  try {
    await activeCall.disconnect();
    activeCall = null;

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
