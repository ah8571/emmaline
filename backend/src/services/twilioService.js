/**
 * Twilio integration service
 * Handles phone call routing, media streaming, and WebRTC connections
 */

import twilio from 'twilio';
import {
  saveCall,
  getUserPhoneNumber,
  saveUserPhoneNumber,
  markUserPhoneNumberReleased
} from './databaseService.js';

let client = null;

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://example.com';
const TWILIO_API_KEY_SID = process.env.TWILIO_API_KEY_SID;
const TWILIO_API_KEY_SECRET = process.env.TWILIO_API_KEY_SECRET;
const TWILIO_TWIML_APP_SID = process.env.TWILIO_TWIML_APP_SID;
const VOICE_TOKEN_TTL_SECONDS = parseInt(process.env.TWILIO_VOICE_TOKEN_TTL_SECONDS || '3600', 10);

const isLoopbackHost = (hostname) => {
  const value = String(hostname || '').toLowerCase();
  return value === 'localhost' || value === '127.0.0.1' || value === '::1';
};

const buildDefaultMediaStreamUrl = () => {
  try {
    const webhook = new URL(WEBHOOK_URL);
    webhook.protocol = 'wss:';
    webhook.pathname = '/ws/media-stream';
    webhook.search = '';
    webhook.hash = '';
    return webhook.toString();
  } catch {
    return 'wss://example.com/ws/media-stream';
  }
};

const getMediaStreamUrl = () => {
  const configured = String(process.env.WEBSOCKET_URL || '').trim();
  const defaultUrl = buildDefaultMediaStreamUrl();

  if (!configured) {
    return defaultUrl;
  }

  try {
    const parsed = new URL(configured);

    if (parsed.protocol !== 'wss:') {
      parsed.protocol = 'wss:';
    }

    if (isLoopbackHost(parsed.hostname)) {
      console.warn(
        `WEBSOCKET_URL (${configured}) points to localhost and is unreachable from Twilio; using ${defaultUrl} instead.`
      );
      return defaultUrl;
    }

    return parsed.toString();
  } catch {
    console.warn(`Invalid WEBSOCKET_URL (${configured}); using ${defaultUrl} instead.`);
    return defaultUrl;
  }
};

const sanitizeClientIdentity = (identity) => {
  return String(identity || '')
    .replace(/[^a-zA-Z0-9_\-=\.]/g, '_')
    .slice(0, 121);
};

/**
 * Get Twilio client instance
 */
export const getTwilioClient = () => {
  if (client) {
    return client;
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error('Twilio client not initialized. Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN');
  }

  client = twilio(accountSid, authToken);
  return client;
};

export const generateVoiceAccessToken = ({ identity }) => {
  if (!process.env.TWILIO_ACCOUNT_SID || !TWILIO_API_KEY_SID || !TWILIO_API_KEY_SECRET || !TWILIO_TWIML_APP_SID) {
    throw new Error('Missing Twilio Voice token configuration (account SID, API key SID/secret, or TwiML App SID)');
  }

  const clientIdentity = sanitizeClientIdentity(identity);

  if (!clientIdentity) {
    throw new Error('Voice token identity is required');
  }

  const AccessToken = twilio.jwt.AccessToken;
  const VoiceGrant = AccessToken.VoiceGrant;

  const accessToken = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    TWILIO_API_KEY_SID,
    TWILIO_API_KEY_SECRET,
    {
      identity: clientIdentity,
      ttl: VOICE_TOKEN_TTL_SECONDS
    }
  );

  accessToken.addGrant(
    new VoiceGrant({
      outgoingApplicationSid: TWILIO_TWIML_APP_SID,
      incomingAllow: false
    })
  );

  return {
    token: accessToken.toJwt(),
    identity: clientIdentity,
    ttl: VOICE_TOKEN_TTL_SECONDS
  };
};

export const generateClientConnectTwiML = ({ userId, identity }) => {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const response = new VoiceResponse();
  const mediaStreamUrl = getMediaStreamUrl();

  const connect = response.connect();
  connect.stream({
    url: mediaStreamUrl,
    parameter: {
      source: 'in-app-voip',
      userId: userId || null,
      identity: identity || null
    }
  });

  return response.toString();
};

export const findAvailablePhoneNumbers = async ({ countryCode = 'US', areaCode, limit = 5 }) => {
  const twilioClient = getTwilioClient();
  const targetCountryCode = String(countryCode || 'US').toUpperCase();

  let availableNumbers = [];

  if (areaCode) {
    availableNumbers = await twilioClient
      .availablePhoneNumbers(targetCountryCode)
      .local.list({ areaCode, limit });
  } else {
    availableNumbers = await twilioClient
      .availablePhoneNumbers(targetCountryCode)
      .local.list({ limit });
  }

  return availableNumbers.map((number) => ({
    phoneNumber: number.phoneNumber,
    friendlyName: number.friendlyName,
    locality: number.locality,
    region: number.region,
    isoCountry: number.isoCountry
  }));
};

export const provisionDedicatedNumberForUser = async (userId, options = {}) => {
  const existingNumber = await getUserPhoneNumber(userId);

  if (existingNumber) {
    return {
      alreadyAssigned: true,
      number: existingNumber
    };
  }

  const twilioClient = getTwilioClient();
  const countryCode = String(options.countryCode || 'US').toUpperCase();
  const limit = 1;

  const candidates = await twilioClient
    .availablePhoneNumbers(countryCode)
    .local.list(options.areaCode ? { areaCode: options.areaCode, limit } : { limit });

  if (!candidates.length) {
    throw new Error('No available phone numbers found for requested region');
  }

  const selectedNumber = candidates[0];
  const incomingPhoneNumber = await twilioClient.incomingPhoneNumbers.create({
    phoneNumber: selectedNumber.phoneNumber,
    voiceUrl: `${WEBHOOK_URL}/api/twilio/webhook`,
    voiceMethod: 'POST',
    statusCallback: `${WEBHOOK_URL}/api/twilio/call-status`,
    statusCallbackMethod: 'POST'
  });

  const stored = await saveUserPhoneNumber(userId, {
    twilioPhoneSid: incomingPhoneNumber.sid,
    phoneNumber: incomingPhoneNumber.phoneNumber,
    friendlyName: incomingPhoneNumber.friendlyName,
    status: 'active'
  });

  return {
    alreadyAssigned: false,
    number: stored
  };
};

export const releaseDedicatedNumberForUser = async (userId) => {
  const existingNumber = await getUserPhoneNumber(userId);

  if (!existingNumber) {
    return {
      released: false,
      reason: 'No active number assigned'
    };
  }

  const twilioClient = getTwilioClient();
  await twilioClient.incomingPhoneNumbers(existingNumber.twilio_phone_sid).remove();
  await markUserPhoneNumberReleased(userId);

  return {
    released: true,
    phoneNumber: existingNumber.phone_number
  };
};

/**
 * Generate TwiML response for incoming call
 * Connects call to WebSocket for real-time media streaming
 */
export const generateIncomingCallTwiML = (callContext = {}) => {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const response = new VoiceResponse();
  const mediaStreamUrl = getMediaStreamUrl();

  // Connect to WebSocket for media streaming
  const connect = response.connect();
  const stream = connect.stream({
    url: mediaStreamUrl,
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
    const twilioClient = getTwilioClient();
    const call = await twilioClient.calls(callSid).fetch();
    return call;
  } catch (error) {
    console.error('Error fetching call from Twilio:', error);
    throw error;
  }
};

export default {
  getTwilioClient,
  generateVoiceAccessToken,
  generateClientConnectTwiML,
  findAvailablePhoneNumbers,
  provisionDedicatedNumberForUser,
  releaseDedicatedNumberForUser,
  generateIncomingCallTwiML,
  handleIncomingCall,
  handleCallStatus,
  handleMediaStream,
  endCall,
  startCallRecording,
  getCallFromTwilio
};
