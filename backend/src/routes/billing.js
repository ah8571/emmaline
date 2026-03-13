import express from 'express';
import authMiddleware from '../middleware/auth.js';
import {
  getUserVoiceBillingStatus,
  grantUserPrepaidVoiceSeconds
} from '../services/billingService.js';

const router = express.Router();

const isBillingAdminAuthorized = (req) => {
  const configuredKey = process.env.BILLING_ADMIN_KEY;

  if (!configuredKey) {
    return false;
  }

  return req.get('x-admin-key') === configuredKey;
};

router.get('/status', authMiddleware, async (req, res) => {
  try {
    const billingStatus = await getUserVoiceBillingStatus(req.user.userId);

    return res.status(200).json({
      success: true,
      billing: billingStatus
    });
  } catch (error) {
    console.error('Error fetching billing status:', error.message);
    return res.status(500).json({ error: 'Failed to fetch billing status' });
  }
});

router.post('/grant-seconds', authMiddleware, async (req, res) => {
  try {
    if (!isBillingAdminAuthorized(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const secondsToAdd = Math.round(Number(req.body?.seconds || 0));

    if (!Number.isFinite(secondsToAdd) || secondsToAdd <= 0) {
      return res.status(400).json({ error: 'seconds must be a positive integer' });
    }

    const result = await grantUserPrepaidVoiceSeconds(req.user.userId, secondsToAdd);

    return res.status(200).json({
      success: true,
      addedSeconds: secondsToAdd,
      billing: result.billingStatus
    });
  } catch (error) {
    console.error('Error granting prepaid seconds:', error.message);
    return res.status(500).json({ error: 'Failed to grant prepaid seconds' });
  }
});

export default router;