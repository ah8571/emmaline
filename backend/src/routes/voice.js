/**
 * Routes for in-app Twilio Voice (VoIP)
 */

import express from 'express';
import twilio from 'twilio';
import authMiddleware from '../middleware/auth.js';
import {
  generateVoiceAccessToken,
  generateClientConnectTwiML,
  findAvailablePhoneNumbers,
  provisionDedicatedNumberForUser,
  releaseDedicatedNumberForUser
} from '../services/twilioService.js';
import { getUserPhoneNumber } from '../services/databaseService.js';

const router = express.Router();

const verifyTwilioRequest = (req, res, next) => {
  const skipValidation = String(process.env.TWILIO_SKIP_REQUEST_VALIDATION || '').toLowerCase() === 'true';

  if (skipValidation) {
    console.warn('Skipping Twilio request signature validation for /api/voice/connect (debug mode enabled).');
    return next();
  }

  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;

  if (!twilioAuthToken) {
    return res.status(500).json({ error: 'Missing TWILIO_AUTH_TOKEN for request validation' });
  }

  const signature = req.get('x-twilio-signature') || '';
  const forwardedProto = req.get('x-forwarded-proto') || req.protocol || 'https';
  const forwardedHost = req.get('x-forwarded-host') || req.get('host') || '';

  const candidateUrls = [
    `${process.env.WEBHOOK_URL || ''}${req.originalUrl}`,
    `${forwardedProto}://${forwardedHost}${req.originalUrl}`
  ].filter(Boolean);

  const isValidRequest = candidateUrls.some((url) =>
    twilio.validateRequest(twilioAuthToken, signature, url, req.body)
  );

  if (!isValidRequest) {
    console.warn('Unauthorized Twilio request on /api/voice/connect', {
      candidateUrls
    });
    return res.status(403).json({ error: 'Unauthorized Twilio request' });
  }

  next();
};

/**
 * POST /api/voice/token
 * Mint Twilio Voice SDK access token for authenticated users
 */
router.post('/token', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const identity = `user_${userId}`;
    const result = generateVoiceAccessToken({ identity });

    return res.status(200).json({
      success: true,
      token: result.token,
      identity: result.identity,
      ttl: result.ttl
    });
  } catch (error) {
    console.error('Error generating voice token:', error.message);

    if (String(error.message || '').includes('Missing Twilio Voice token configuration')) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Failed to generate voice token' });
  }
});

/**
 * POST /api/voice/connect
 * TwiML endpoint used by Twilio Voice SDK (TwiML App Voice URL)
 */
router.post('/connect', verifyTwilioRequest, async (req, res) => {
  try {
    const identity = req.body.identity || req.body.Caller || null;
    const userId = req.body.userId || null;

    const twiml = generateClientConnectTwiML({
      userId,
      identity
    });

    res.type('text/xml');
    return res.send(twiml);
  } catch (error) {
    console.error('Error generating client connect TwiML:', error.message);
    return res.status(500).json({ error: 'Failed to connect voice session' });
  }
});

/**
 * GET /api/voice/numbers/current
 * Retrieve currently assigned dedicated number for authenticated user
 */
router.get('/numbers/current', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const number = await getUserPhoneNumber(userId);

    return res.status(200).json({
      success: true,
      number: number || null
    });
  } catch (error) {
    console.error('Error fetching current dedicated number:', error.message);
    return res.status(500).json({ error: 'Failed to fetch current number' });
  }
});

/**
 * GET /api/voice/numbers/available
 * List available Twilio numbers for provisioning
 */
router.get('/numbers/available', authMiddleware, async (req, res) => {
  try {
    const { countryCode = 'US', areaCode, limit = '5' } = req.query;
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 5, 1), 20);

    const numbers = await findAvailablePhoneNumbers({
      countryCode,
      areaCode,
      limit: parsedLimit
    });

    return res.status(200).json({
      success: true,
      numbers
    });
  } catch (error) {
    console.error('Error listing available dedicated numbers:', error.message);
    return res.status(500).json({ error: 'Failed to list available numbers' });
  }
});

/**
 * POST /api/voice/numbers/provision
 * Provision and assign a dedicated number to authenticated user
 */
router.post('/numbers/provision', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { countryCode = 'US', areaCode } = req.body || {};

    const result = await provisionDedicatedNumberForUser(userId, { countryCode, areaCode });

    if (result.alreadyAssigned) {
      return res.status(409).json({
        success: false,
        message: 'User already has an active dedicated number',
        number: result.number
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Dedicated number provisioned',
      number: result.number
    });
  } catch (error) {
    console.error('Error provisioning dedicated number:', error.message);
    return res.status(500).json({ error: 'Failed to provision dedicated number' });
  }
});

/**
 * DELETE /api/voice/numbers/current
 * Release authenticated user's dedicated number
 */
router.delete('/numbers/current', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await releaseDedicatedNumberForUser(userId);

    if (!result.released) {
      return res.status(404).json({
        success: false,
        message: result.reason
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Dedicated number released',
      phoneNumber: result.phoneNumber
    });
  } catch (error) {
    console.error('Error releasing dedicated number:', error.message);
    return res.status(500).json({ error: 'Failed to release dedicated number' });
  }
});

export default router;
