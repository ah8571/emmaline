import express from 'express';
import { createInworldSession, buildInworldRealtimeConfig } from '../services/inworldVoiceService.js';
import { inworldRtcConfigHandler } from '../controllers/inworldRtcController.js';

const router = express.Router();

router.get('/rtc-config', inworldRtcConfigHandler);

router.post('/session', async (req, res) => {
  try {
    const sessionResponse = await createInworldSession(req.body || {});
    return res.json({
      success: true,
      ...sessionResponse
    });
  } catch (error) {
    console.error('Inworld voice session error:', error.message);
    return res.status(500).json({ success: false, error: error.message || 'Unable to start Inworld voice session.' });
  }
});

router.get('/config', (_req, res) => {
  res.json({
    success: true,
    config: buildInworldRealtimeConfig()
  });
});

export default router;
