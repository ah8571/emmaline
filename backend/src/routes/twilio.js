/**
 * Routes for Twilio webhooks and call management
 * Handles incoming calls, call status updates, and media streaming
 */

import express from 'express';
import twilio from 'twilio';
import { getUserIdByAssignedPhoneNumber } from '../services/databaseService.js';
import {
  handleIncomingCall,
  handleCallStatus,
  handleMediaStream
} from '../services/twilioService.js';

const router = express.Router();

/**
 * Verify Twilio request authenticity
 */
const verifyTwilioRequest = (req, res, next) => {
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioUrl = `${process.env.WEBHOOK_URL}${req.originalUrl}`;

  // Verify the request came from Twilio
  const isValidRequest = twilio.validateRequest(
    twilioAuthToken,
    req.get('x-twilio-signature') || '',
    twilioUrl,
    req.body
  );

  if (!isValidRequest) {
    console.warn('Invalid Twilio request signature');
    return res.status(403).json({ error: 'Unauthorized' });
  }

  next();
};

/**
 * POST /api/twilio/webhook
 * Incoming call webhook from Twilio
 */
router.post('/webhook', verifyTwilioRequest, async (req, res) => {
  try {
    const callSid = req.body.CallSid;
    const from = req.body.From;
    const to = req.body.To;

    // Identify user either from explicit webhook context or dedicated phone mapping
    const userIdFromPayload = req.body.UserId || null;
    const userIdFromDedicatedNumber = to ? await getUserIdByAssignedPhoneNumber(to) : null;
    const userId = userIdFromPayload || userIdFromDedicatedNumber;

    if (!userId) {
      console.warn('No userId provided in incoming call');
      // Return a basic greeting TwiML if no user context
      const VoiceResponse = twilio.twiml.VoiceResponse;
      const response = new VoiceResponse();
      response.say('Welcome to Emmaline. We could not identify your account.');
      response.hangup();

      res.type('text/xml');
      return res.send(response.toString());
    }

    // Handle the incoming call
    return handleIncomingCall(req, res, userId);
  } catch (error) {
    console.error('Error in Twilio webhook:', error);
    res.status(500).json({ error: 'Failed to process call' });
  }
});

/**
 * POST /api/twilio/call-status
 * Call status update webhook from Twilio
 */
router.post('/call-status', verifyTwilioRequest, async (req, res) => {
  try {
    const callSid = req.body.CallSid;
    const callStatus = req.body.CallStatus; // queued, ringing, in-progress, completed, busy, failed, no-answer, canceled

    // Extract duration if available
    const duration = parseInt(req.body.CallDuration) || 0;

    console.log(`Call status update: ${callSid} -> ${callStatus}`);

    // Update call status in database
    await handleCallStatus(callSid, callStatus, duration);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing call status:', error);
    return res.status(500).json({ error: 'Failed to process status update' });
  }
});

/**
 * WebSocket endpoint for media streaming
 * This would typically be handled by a WebSocket library
 * For now, this is a placeholder
 */
router.post('/media-stream', async (req, res) => {
  try {
    // TODO: Implement WebSocket handling for media streams
    // This requires:
    // 1. ws (WebSocket) library
    // 2. Audio processing pipeline
    // 3. Speech-to-text integration
    // 4. AI response generation
    // 5. Text-to-speech conversion

    // Temporary response
    res.status(200).json({
      message: 'Media stream endpoint - WebSocket upgrade required',
      status: 'TODO'
    });
  } catch (error) {
    console.error('Error in media stream:', error);
    res.status(500).json({ error: 'Failed to handle media stream' });
  }
});

export default router;
