/**
 * WebSocket Media Stream Manager
 * Handles real-time audio streaming from Twilio
 * Manages connections, audio buffering, and message routing
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

/**
 * Represents an active media stream connection
 */
class MediaStreamConnection extends EventEmitter {
  constructor(callSid, userId) {
    super();
    this.callSid = callSid;
    this.userId = userId;
    this.connectionId = uuidv4();
    this.createdAt = new Date();
    this.isActive = false;
    this.audioBuffer = [];
    this.transcriptBuffer = [];
    this.stats = {
      audioChunksReceived: 0,
      bytesReceived: 0,
      transcriptLinesReceived: 0
    };
  }

  /**
   * Mark connection as active
   */
  activate() {
    this.isActive = true;
    this.emit('activated', { connectionId: this.connectionId });
  }

  /**
   * Add audio chunk to buffer
   */
  addAudioChunk(payload) {
    this.audioBuffer.push({
      data: payload,
      timestamp: Date.now()
    });

    this.stats.audioChunksReceived++;
    this.stats.bytesReceived += payload.length;

    this.emit('audioChunk', { payload, timestamp: Date.now() });
  }

  /**
   * Add transcript line to buffer
   */
  addTranscriptLine(text, isFinal = false) {
    const line = {
      text,
      isFinal,
      timestamp: Date.now()
    };

    this.transcriptBuffer.push(line);
    this.stats.transcriptLinesReceived++;

    this.emit('transcript', line);
  }

  /**
   * Get current audio buffer size
   */
  getAudioBufferSize() {
    return this.audioBuffer.length;
  }

  /**
   * Clear audio buffer (usually after processing)
   */
  clearAudioBuffer() {
    this.audioBuffer = [];
  }

  /**
   * Get connection statistics
   */
  getStats() {
    return {
      ...this.stats,
      duration: Date.now() - this.createdAt.getTime(),
      bufferSize: this.audioBuffer.length,
      transcriptLines: this.transcriptBuffer.length
    };
  }

  /**
   * Close connection
   */
  close() {
    this.isActive = false;
    this.emit('closed', {
      connectionId: this.connectionId,
      duration: Date.now() - this.createdAt.getTime()
    });
  }
}

/**
 * Media Stream Manager
 * Manages multiple concurrent media stream connections
 */
class MediaStreamManager {
  constructor() {
    this.connections = new Map(); // callSid -> MediaStreamConnection
    this.userConnections = new Map(); // userId -> Set of callSids
  }

  /**
   * Create new media stream connection
   */
  createConnection(callSid, userId) {
    const connection = new MediaStreamConnection(callSid, userId);

    this.connections.set(callSid, connection);

    // Track connections per user
    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set());
    }
    this.userConnections.get(userId).add(callSid);

    console.log(`Created media stream: ${callSid} for user ${userId}`);

    return connection;
  }

  /**
   * Get connection by call SID
   */
  getConnection(callSid) {
    return this.connections.get(callSid);
  }

  /**
   * Get all connections for user
   */
  getUserConnections(userId) {
    const callSids = this.userConnections.get(userId) || new Set();
    return Array.from(callSids).map(sid => this.connections.get(sid));
  }

  /**
   * Close connection and cleanup
   */
  closeConnection(callSid) {
    const connection = this.connections.get(callSid);

    if (connection) {
      connection.close();
      this.connections.delete(callSid);

      // Remove from user connections
      const userId = connection.userId;
      if (this.userConnections.has(userId)) {
        this.userConnections.get(userId).delete(callSid);

        // Clean up empty user set
        if (this.userConnections.get(userId).size === 0) {
          this.userConnections.delete(userId);
        }
      }

      console.log(`Closed media stream: ${callSid}`);
    }
  }

  /**
   * Get total active connections
   */
  getActiveConnectionCount() {
    return this.connections.size;
  }

  /**
   * Get all active connections
   */
  getAllConnections() {
    return Array.from(this.connections.values());
  }

  /**
   * Get connection stats
   */
  getConnectionStats(callSid) {
    const connection = this.connections.get(callSid);
    return connection ? connection.getStats() : null;
  }
}

// Export singleton instance
export const mediaStreamManager = new MediaStreamManager();

export { MediaStreamConnection, MediaStreamManager };
