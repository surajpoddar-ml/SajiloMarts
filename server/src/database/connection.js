import mongoose from 'mongoose';
import { databaseConfig } from '../config/index.js';

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
   * @param {string} [uri] - Optional MongoDB connection string override
   * @param {object} [options] - Optional Mongoose connection options override
   * @returns {Promise<mongoose.Connection>}
   */
  async connect(uri = databaseConfig.uri, options = databaseConfig.options) {
    if (this.connection && mongoose.connection.readyState === 1) {
      return this.connection;
    }

    if (!uri) {
      throw new Error('MongoDB URI is not configured in database configuration');
    }

    const conn = await mongoose.connect(uri, options);
    this.connection = conn.connection;
    this.isConnected = true;
    return this.connection;
  }
}

export const dbConnection = new DatabaseConnection();
export const connectDatabase = (uri, options) => dbConnection.connect(uri, options);
export const getDatabaseState = () => dbConnection.getState();
export const isDatabaseConnected = () => dbConnection.isReady();
