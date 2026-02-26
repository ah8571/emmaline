/**
 * Twilio integration service
 * Handles phone call routing, media streaming, and WebRTC connections
 */

import twilio from 'twilio';
import { saveCall, saveTranscript } from './databaseService.js';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://example.com';
const WEBSOCKET_URL = process.env.WEBSOCKET_URL || 'wss://example.com/ws/media-stream';

/**
 * Get Twilio client instance
 */
export const getTwilioClient = () => client;

/**
 * Generate TwiML response for incoming call
 * Connects call to WebSocket for real-time media streaming
 */
export const generateIncomingCallTwiML = (callContext = {}) => {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const response = new VoiceResponse();

  // Connect to WebSocket for media streaming
  const connect = response.connect();
  const stream = connect.stream({
    url: WEBSOCKET_URL,
    // Pass custom parameters to WebSocket connection
    parameter: {
      userId: callContext.userId || null,
      callSid: callContext.callSid || null
    }
  });

  return response.toString();
};

/**
 * Handle incoming call webhook from Twilio
 */
export const handleIncomingCall = async (req, res, userId) => {
  try {
    // Extract call information from Twilio webhook
    const callSid = req.body.CallSid;
    const from = req.body.From;
    const to = req.body.To;

    console.log(`Incoming call: ${callSid} from ${from}`);

    // Create call record in database
    const callData = {
      phoneNumber: from,
      duration: 0,
      startedAt: new Date().toISOString(),
      endedAt: null,
      status: 'in-progress',
      twilioCallSid: callSid
    };

    const savedCall = await saveCall(userId, callData);
    console.log('Call saved:', savedCall.id);

    // Generate TwiML response to accept and stream call
    const twiml = generateIncomingCallTwiML({
      userId,
      callSid
    });

    res.type('text/xml');
    return res.send(twiml);
  } catch (error) {
    console.error('Error handling incoming call:', error);
    return res.status(500).json({ error: 'Failed to handle incoming call' });
  }
};

/**
 * Initiate outbound call
 * Returns a phone number to dial from the mobile app
 */
export const initiateOutboundCall = async (userId) => {
  try {
    // Create TwiML for outbound call
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();

    const connect = response.connect();
    const stream = connect.stream({
      url: WEBSOCKET_URL,
      parameter: {
        userId
      }
    });

    const twiml = response.toString();

    // Create call data record (will be updated when call actually connects)
    const callData = {
      phoneNumber: TWILIO_PHONE_NUMBER,
      duration: 0,
      startedAt: new Date().toISOString(),
      endedAt: null,
      status: 'initiated',
      twilioCallSid: null
    };

    const savedCall = await saveCall(userId, callData);

    return {
      callId: savedCall.id,
      phoneNumber: TWILIO_PHONE_NUMBER,
      sessionId: savedCall.id,
      instructions: `Call ${TWILIO_PHONE_NUMBER} from your phone`
    };
  } catch (error) {
    console.error('Error initiating outbound call:', error);
    throw error;
  }
};

/**
 * Handle call status update (from Twilio webhook)
 */
export const handleCallStatus = async (callSid, status, duration = 0) => {
  try {
    // TODO: Update call status in database
    // This is called when call ends or changes status
    console.log(`Call ${callSid} status: ${status}, duration: ${duration}s`);

    return {
      success: true,
      status
    };
  } catch (error) {
    console.error('Error updating call status:', error);
    throw error;
  }
};

/**
 * Process media stream messages from Twilio
 * Audio chunks are converted to text and sent to AI
 */
export const handleMediaStream = async (message, callContext) => {
  try {
    // TODO: This would be called for each audio chunk
    // Steps:
    // 1. Parse audio from media stream message
    // 2. Send to Google Cloud Speech-to-Text
    // 3. Get transcription
    // 4. Send to OpenAI for response
    // 5. Convert response to audio with TTS
    // 6. Send back through media stream

    // Message format varies based on WebSocket event type
    // Possible types: start, media, stop, etc.

    const eventType = message.event;

    switch (eventType) {
      case 'start':
        console.log('Media stream started');
        return { ok: true };

      case 'media':
        // Handle audio chunk
        // message.media.payload contains base64 audio data
        console.log('Received audio chunk');
        // TODO: Process audio
        return { ok: true };

      case 'stop':
        console.log('Media stream stopped');
        return { ok: true };

      default:
        console.log('Unknown event:', eventType);
        return { ok: true };
    }
  } catch (error) {
    console.error('Error handling media stream:', error);
    throw error;
  }
};

/**
 * End a call
 */
export const endCall = async (twilioCallSid) => {
  try {
    // Update call status in Twilio (if needed)
    // This is usually triggered by user hanging up
    // Database update happens in route handler

    console.log(`Ending call: ${twilioCallSid}`);

    // TODO: Save final transcript and summary
    // TODO: Clean up any open resources

    return { success: true };
  } catch (error) {
    console.error('Error ending call:', error);
    throw error;
  }
};

/**
 * Record call audio
 * Note: Requires proper Twilio configuration for recording
 */
export const startCallRecording = async (callSid) => {
  try {
    // TODO: Start recording call using Twilio API
    // Only if Twilio account has recording enabled

    return { success: true };
  } catch (error) {
    console.error('Error starting recording:', error);
    throw error;
  }
};

/**
 * Get call details from Twilio
 */
export const getCallFromTwilio = async (callSid) => {
  try {
    const call = await client.calls(callSid).fetch();
    return call;
  } catch (error) {
    console.error('Error fetching call from Twilio:', error);
    throw error;
  }
};

export default {
  getTwilioClient,
  generateIncomingCallTwiML,
  handleIncomingCall,
  initiateOutboundCall,
  handleCallStatus,
  handleMediaStream,
  endCall,
  startCallRecording,
  getCallFromTwilio
};

/**
 * Generate TwiML response for incoming call
 */
export const generateIncomingCallTwiML = () => {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const response = new VoiceResponse();

  // Connect to WebSocket for media streaming
  const connect = response.connect();
  const stream = connect.stream({
    url: MEDIA_STREAM_URL
  });

  return response.toString();
};

/**
 * Handle incoming call webhook from Twilio
 */
export const handleIncomingCall = async (req, res, userId) => {
  try {
    // Extract call information from Twilio webhook
    const callSid = req.body.CallSid;
    const from = req.body.From;
    const to = req.body.To;

    console.log(`Incoming call: ${callSid} from ${from}`);

    // Create call record in database
    const callData = {
      phoneNumber: from,
      duration: 0,
      startedAt: new Date().toISOString(),
      endedAt: null,
      status: 'in-progress',
      twilioCallSid: callSid
    };

    const savedCall = await saveCall(userId, callData);
    console.log('Call saved:', savedCall.id);

    // Generate TwiML response to accept and stream call
    const twiml = generateIncomingCallTwiML();

    res.type('text/xml');
    return res.send(twiml);
  } catch (error) {
    console.error('Error handling incoming call:', error);
    return res.status(500).json({ error: 'Failed to handle incoming call' });
  }
};

/**
 * Initiate outbound call
 * Returns a phone number to dial from the mobile app
 */
export const initiateOutboundCall = async (userId) => {
  try {
    // Create TwiML for outbound call
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();

    const connect = response.connect();
    const stream = connect.stream({
      url: MEDIA_STREAM_URL
    });

    const twiml = response.toString();

    // Create call data record (will be updated when call actually connects)
    const callData = {
      phoneNumber: TWILIO_PHONE_NUMBER,
      duration: 0,
      startedAt: new Date().toISOString(),
      endedAt: null,
      status: 'initiated',
      twilioCallSid: null
    };

    const savedCall = await saveCall(userId, callData);

    return {
      callId: savedCall.id,
      phoneNumber: TWILIO_PHONE_NUMBER,
      sessionId: savedCall.id,
      instructions: `Call ${TWILIO_PHONE_NUMBER} from your phone`
    };
  } catch (error) {
    console.error('Error initiating outbound call:', error);
    throw error;
  }
};

/**
 * Handle call status update (from Twilio webhook)
 */
export const handleCallStatus = async (callSid, status, duration = 0) => {
  try {
    // TODO: Update call status in database
    // This is called when call ends or changes status
    console.log(`Call ${callSid} status: ${status}, duration: ${duration}s`);

    return {
      success: true,
      status
    };
  } catch (error) {
    console.error('Error updating call status:', error);
    throw error;
  }
};

/**
 * Process media stream messages from Twilio
 * Audio chunks are converted to text and sent to AI
 */
export const handleMediaStream = async (message, callContext) => {
  try {
    // TODO: This would be called for each audio chunk
    // Steps:
    // 1. Parse audio from media stream message
    // 2. Send to Google Cloud Speech-to-Text
    // 3. Get transcription
    // 4. Send to OpenAI for response
    // 5. Convert response to audio with TTS
    // 6. Send back through media stream

    // Message format varies based on WebSocket event type
    // Possible types: start, media, stop, etc.

    const eventType = message.event;

    switch (eventType) {
      case 'start':
        console.log('Media stream started');
        return { ok: true };

      case 'media':
        // Handle audio chunk
        // message.media.payload contains base64 audio data
        console.log('Received audio chunk');
        // TODO: Process audio
        return { ok: true };

      case 'stop':
        console.log('Media stream stopped');
        return { ok: true };

      default:
        console.log('Unknown event:', eventType);
        return { ok: true };
    }
  } catch (error) {
    console.error('Error handling media stream:', error);
    throw error;
  }
};

/**
 * End a call
 */
export const endCall = async (twilioCallSid) => {
  try {
    // Update call status in Twilio (if needed)
    // This is usually triggered by user hanging up
    // Database update happens in route handler

    console.log(`Ending call: ${twilioCallSid}`);

    // TODO: Save final transcript and summary
    // TODO: Clean up any open resources

    return { success: true };
  } catch (error) {
    console.error('Error ending call:', error);
    throw error;
  }
};

/**
 * Record call audio
 * Note: Requires proper Twilio configuration for recording
 */
export const startCallRecording = async (callSid) => {
  try {
    // TODO: Start recording call using Twilio API
    // Only if Twilio account has recording enabled

    return { success: true };
  } catch (error) {
    console.error('Error starting recording:', error);
    throw error;
  }
};

/**
 * Get call details from Twilio
 */
export const getCallFromTwilio = async (callSid) => {
  try {
    const call = await client.calls(callSid).fetch();
    return call;
  } catch (error) {
    console.error('Error fetching call from Twilio:', error);
    throw error;
  }
};

export default {
  getTwilioClient,
  generateIncomingCallTwiML,
  handleIncomingCall,
  initiateOutboundCall,
  handleCallStatus,
  handleMediaStream,
  endCall,
  startCallRecording,
  getCallFromTwilio
};
