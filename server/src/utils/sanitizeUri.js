/**
 * Masks user credentials from MongoDB connection strings for safe logging.
 * Handles standard mongodb://, Atlas mongodb+srv://, and URL-encoded passwords.
 * Example: mongodb+srv://user:secret123@cluster0.abc.mongodb.net/db -> mongodb+srv://***:***@cluster0.abc.mongodb.net/db
 * @param {string} uri - Raw connection string
 * @returns {string} - Masked connection string safe for operational logs
 */
export const sanitizeMongoUri = (uri) => {
  if (!uri || typeof uri !== 'string') return '';
  try {
    return uri.replace(
      /(mongodb(?:\+srv)?:\/\/)([^:@\s]+):([^@\s]+)@/gi,
      '$1***:***@'
    );
  } catch {
    return 'mongodb://[masked]';
  }
};
