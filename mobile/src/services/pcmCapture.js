import { NativeModules, NativeEventEmitter } from 'react-native';

const { PcmCapture } = NativeModules;
const emitter = PcmCapture ? new NativeEventEmitter(PcmCapture) : null;

let chunkCount = 0;

export const startPcmCapture = ({ sampleRate = 24000, onData } = {}) => {
  if (!PcmCapture || !emitter || typeof PcmCapture.init !== 'function' || typeof PcmCapture.start !== 'function' || typeof PcmCapture.stop !== 'function') {
    throw new Error('PcmCapture native module is unavailable. Reinstall the Android development build.');
  }

  chunkCount = 0;

  const subscription = emitter.addListener('pcmData', (base64Data) => {
    chunkCount++;
    onData?.(base64Data);
  });

  PcmCapture.init({ sampleRate });
  PcmCapture.start();

  return {
    stop: () => {
      subscription.remove();
      PcmCapture.stop();
    }
  };
};
