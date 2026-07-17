import { resolveApiKey } from '../services/inworldVoiceService.js';

const INWORLD_HOST = process.env.INWORLD_HOST || 'api.inworld.ai';
const INWORLD_BASE = `https://${INWORLD_HOST}`;

export const inworldRtcConfigHandler = async (_req, res) => {
  try {
    const { key } = resolveApiKey();

    // Fetch ICE servers from Inworld
    let iceServers = [];
    try {
      const iceRes = await fetch(`${INWORLD_BASE}/v1/realtime/ice-servers`, {
        headers: { Authorization: `Bearer ${key}` }
      });
      if (iceRes.ok) {
        const data = await iceRes.json();
        iceServers = data.ice_servers || [];
      }
    } catch (err) {
      console.warn('[InworldRTC] Failed to fetch ICE servers:', err.message);
    }

    return res.json({
      success: true,
      config: {
        apiKey: key,
        iceServers,
        callUrl: `${INWORLD_BASE}/v1/realtime/calls`
      }
    });
  } catch (error) {
    console.error('[InworldRTC] Config error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export default inworldRtcConfigHandler;
