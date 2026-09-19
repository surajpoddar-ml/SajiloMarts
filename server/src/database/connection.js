import mongoose from 'mongoose';

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
   * Connects to MongoDB Atlas / instance using provided URI and options.
   * @param {string} uri - MongoDB connection string
   * @param {object} options - Mongoose connection options
   * @returns {Promise<mongoose.Connection>}
   */
  async connect(uri, options = {}) {
    if (this.connection && mongoose.connection.readyState === 1) {
      return this.connection;
    }

    if (!uri) {
      throw new Error('MongoDB URI is required to initialize database connection');
    }

    const conn = await mongoose.connect(uri, options);
    this.connection = conn.connection;
    this.isConnected = true;
    return this.connection;
  }
}

export const dbConnection = new DatabaseConnection();
export const connectDatabase = (uri, options) => dbConnection.connect(uri, options);
