import mongoose from 'mongoose';
import { databaseConfig } from '../config/index.js';

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
