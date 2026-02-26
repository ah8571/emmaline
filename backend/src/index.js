import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import http from 'http';
import WebSocket from 'ws';

// Load environment variables
dotenv.config();

// Import routes
import twilioRoutes from './routes/twilio.js';
import callRoutes from './routes/calls.js';
import noteRoutes from './routes/notes.js';
import authRoutes from './routes/auth.js';

// Import middleware
import { errorHandler, requestLogger } from './middleware/index.js';

// Import WebSocket handler
import { handleMediaStreamWebSocket } from './websocket/mediaStreamHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server for WebSocket support
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server, path: '/ws/media-stream' });

// Handle WebSocket connections
wss.on('connection', handleMediaStreamWebSocket);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(requestLogger);

// Routes
app.use('/api/twilio', twilioRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Emmaline AI Phone Call Buddy - Backend API',
    version: '0.1.0',
    endpoints: {
      health: '/health',
      twilio: '/api/twilio/webhook',
      calls: '/api/calls',
      notes: '/api/notes',
      auth: '/api/auth',
      websocket: 'wss://localhost:3000/ws/media-stream'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path });
});

// Error handler
app.use(errorHandler);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Emmaline backend running on port ${PORT}`);
  console.log(`📡 WebSocket server listening at wss://localhost:${PORT}/ws/media-stream`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Twilio account configured: ${process.env.TWILIO_ACCOUNT_SID ? '✓' : '✗'}`);
  console.log(`Supabase configured: ${process.env.SUPABASE_URL ? '✓' : '✗'}`);
  console.log(`OpenAI configured: ${process.env.OPENAI_API_KEY ? '✓' : '✗'}`);
  console.log(`Google Cloud configured: ${process.env.GOOGLE_APPLICATION_CREDENTIALS ? '✓' : '✗'}`);
});

export default app;

