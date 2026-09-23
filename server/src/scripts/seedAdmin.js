import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/user.model.js';
import { USER_ROLES } from '../constants/roles.js';
import { logger } from '../config/logger.js';
import { normalizeEmail } from '../utils/normalizeEmail.js';

dotenv.config();

/**
 * Secure Administrator Provisioning Script
 * Safely creates or updates the initial bootstrap administrator account using environment variables.
 * Never exposes plaintext credentials in logs or source code.
 */
export const provisionAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || 'SajiloMarts System Admin';
  const adminPhone = process.env.ADMIN_PHONE || '+9779800000000';

  if (!adminEmail || !adminPassword) {
    logger.error('ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required to provision an admin account');
    throw new Error('Missing administrator provisioning environment variables');
  }

  const normalized = normalizeEmail(adminEmail);

  let existingAdmin = await User.findOne({ email: normalized });

  if (existingAdmin) {
    logger.info(`Admin account already exists for ${normalized}. Ensuring admin role and active status...`);
    existingAdmin.role = USER_ROLES.ADMIN;
    existingAdmin.isActive = true;
    existingAdmin.isEmailVerified = true;
    if (adminPassword && adminPassword.length >= 8) {
      existingAdmin.password = adminPassword; // Triggers pre-save bcrypt hash
    }
    await existingAdmin.save();
    logger.info(`Administrator account successfully updated for ${normalized}`);
    return existingAdmin;
  }

  const newAdmin = new User({
    name: adminName,
    email: normalized,
    password: adminPassword,
    phone: adminPhone,
    role: USER_ROLES.ADMIN,
    isActive: true,
    isEmailVerified: true,
  });

  await newAdmin.save();
  logger.info(`Administrator account successfully provisioned for ${normalized}`);
  return newAdmin;
};

// Execute directly if run via CLI
if (process.argv[1] && process.argv[1].endsWith('seedAdmin.js')) {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MONGODB_URI is required');
    process.exit(1);
  }

  mongoose
    .connect(mongoUri)
    .then(async () => {
      await provisionAdmin();
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch((err) => {
      console.error('Failed to provision admin:', err.message);
      process.exit(1);
    });
}
