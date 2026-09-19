import mongoose from 'mongoose';
import dns from 'node:dns';
import { databaseConfig } from '../config/index.js';
import { sanitizeMongoUri } from '../utils/index.js';

export const MONGO_READY_STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
  99: 'uninitialized',
};

/**
 * MongoDB Connection Service
 * Manages Mongoose connection lifecycle, state inspection, and graceful termination.
 */
class DatabaseConnection {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.eventsBound = false;
    this.connectingPromise = null;
  }

  /**
   * Binds Mongoose connection event listeners.
   */
  bindEvents() {
    if (this.eventsBound) return;

    mongoose.connection.on('connected', () => {
      this.isConnected = true;
      console.log('📦 MongoDB connection established successfully');
    });

    mongoose.connection.on('disconnected', () => {
      this.isConnected = false;
      console.warn('⚠️ MongoDB connection lost/disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      this.isConnected = true;
      console.log('🔄 MongoDB connection re-established');
    });

    mongoose.connection.on('error', (err) => {
      this.isConnected = false;
      const sanitizedMessage = sanitizeMongoUri(err.message || 'Connection error');
      console.error('❌ MongoDB connection error occurred:', sanitizedMessage);
    });

    this.eventsBound = true;
  }

  /**
   * Returns the current connection state as a readable descriptor.
   * @returns {{ status: string, code: number, isConnected: boolean }}
   */
  getState() {
    const code = mongoose.connection ? mongoose.connection.readyState : 0;
    const status = MONGO_READY_STATES[code] || 'unknown';
    return {
      status,
      code,
      isConnected: code === 1,
    };
  }

  /**
   * Helper check returning true only if MongoDB is actively connected.
   * @returns {boolean}
   */
  isReady() {
    return mongoose.connection && mongoose.connection.readyState === 1;
  }

  /**
   * Connects to MongoDB Atlas / instance using configured database options.
   * Prevents concurrent duplicated connection attempts via in-flight promise sharing.
   * Handles Windows/ISP SRV DNS resolution issues automatically.
   * @param {string} [uri] - Optional MongoDB connection string override
   * @param {object} [options] - Optional Mongoose connection options override
   * @returns {Promise<mongoose.Connection>}
   */
  async connect(uri = databaseConfig.uri, options = databaseConfig.options) {
    if (this.connection && mongoose.connection.readyState === 1) {
      return this.connection;
    }

    if (this.connectingPromise) {
      return this.connectingPromise;
    }

    if (!uri) {
      const missingUriErr = new Error('MONGODB_URI is required to initialize database connection');
      missingUriErr.name = 'DatabaseConfigurationError';
      throw missingUriErr;
    }

    // Ensure reliable DNS resolution for MongoDB Atlas SRV URIs on Windows
    if (uri.startsWith('mongodb+srv://')) {
      try {
        dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
      } catch {
        // Fallback to default system DNS if setServers is restricted
      }
    }

    this.bindEvents();

    this.connectingPromise = (async () => {
      try {
        const conn = await mongoose.connect(uri, options);
        this.connection = conn.connection;
        this.isConnected = true;
        this.connectingPromise = null;
        return this.connection;
      } catch (err) {
        // If initial attempt failed with querySrv error, retry once with public DNS servers
        if (err.message && err.message.includes('querySrv')) {
          try {
            dns.setServers(['8.8.8.8', '1.1.1.1']);
            const retryConn = await mongoose.connect(uri, options);
            this.connection = retryConn.connection;
            this.isConnected = true;
            this.connectingPromise = null;
            return this.connection;
          } catch (retryErr) {
            err = retryErr;
          }
        }

        this.connection = null;
        this.isConnected = false;
        this.connectingPromise = null;
        const safeErrorMessage = sanitizeMongoUri(err.message);
        const connectionErr = new Error(`Failed to connect to MongoDB: ${safeErrorMessage}`);
        connectionErr.name = 'DatabaseConnectionError';
        connectionErr.code = err.code || 'CONNECTION_FAILED';
        connectionErr.originalError = err;
        throw connectionErr;
      }
    })();

    return this.connectingPromise;
  }

  /**
   * Disconnects and closes the active Mongoose connection cleanly.
   * @param {boolean} [force=false] - Force immediate close without waiting for pending ops
   * @returns {Promise<void>}
   */
  async disconnect(force = false) {
    if (mongoose.connection && mongoose.connection.readyState !== 0) {
      try {
        await mongoose.disconnect();
      } catch (disconnectErr) {
        console.warn('⚠️ Warning during Mongoose disconnect:', disconnectErr.message);
      } finally {
        this.connection = null;
        this.isConnected = false;
        this.connectingPromise = null;
        console.log('🛑 MongoDB connection closed cleanly');
      }
    }
  }
}

export const dbConnection = new DatabaseConnection();
export const connectDatabase = (uri, options) => dbConnection.connect(uri, options);
export const disconnectDatabase = (force) => dbConnection.disconnect(force);
export const getDatabaseState = () => dbConnection.getState();
export const isDatabaseConnected = () => dbConnection.isReady();
