const liveCallsEnabled = String(process.env.EXPO_PUBLIC_ENABLE_LIVE_CALLS || 'false')
  .trim()
  .toLowerCase() === 'true';

module.exports = {
  dependencies: liveCallsEnabled
    ? {}
    : {
        '@twilio/voice-react-native-sdk': {
          platforms: {
            android: null,
            ios: null
          }
        }
      }
};