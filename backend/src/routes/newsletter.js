/**
 * Routes for newsletter and waitlist management
 */

import express from 'express';

const router = express.Router();

/**
 * POST /api/newsletter
 * Subscribe email to newsletter/waitlist
 */
router.post('/', async (req, res) => {
  try {
    const { email, source } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // TODO: Store email in database (Supabase)
    // For now, just log and confirm
    console.log(`📧 Newsletter signup: ${email} (source: ${source || 'unknown'})`);

    return res.status(201).json({
      message: 'Successfully subscribed to newsletter',
      email
    });
  } catch (error) {
    console.error('Newsletter signup error:', error);
    return res.status(500).json({ error: 'Failed to subscribe' });
  }
});

/**
 * GET /api/newsletter/stats
 * Get waitlist statistics (admin only)
 */
router.get('/stats', async (req, res) => {
  try {
    // TODO: Implement with proper authentication
    return res.status(200).json({
      waitlistSize: 0,
      signupsThisWeek: 0
    });
  } catch (error) {
    console.error('Error fetching newsletter stats:', error);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
