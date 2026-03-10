/**
 * Minimal WebSocket echo handler used to validate raw WebSocket transport.
 */

export const handleEchoWebSocket = (ws) => {
  console.log('🔁 New echo WebSocket connection');

  ws.on('message', (data) => {
    try {
      if (ws.readyState === ws.OPEN) {
        ws.send(data, { compress: false });
      }
    } catch (error) {
      console.error('Echo WebSocket error while sending message:', error);
    }
  });

  ws.on('close', () => {
    console.log('🔁 Echo WebSocket connection closed');
  });

  ws.on('error', (error) => {
    console.error('Echo WebSocket error:', error);
  });
};

export default {
  handleEchoWebSocket
};