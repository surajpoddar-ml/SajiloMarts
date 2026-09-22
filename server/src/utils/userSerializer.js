/**
 * Safely serializes a User document or plain object for client-facing API responses.
 * Strictly omits passwords, hashes, internal mongoose metadata, and private tokens.
 *
 * @param {Object} user - Mongoose User document or plain object
 * @returns {Object|null} Sanitized user profile
 */
export const toSafeUser = (user) => {
  if (!user) return null;

  const raw = typeof user.toObject === 'function' ? user.toObject() : { ...user };

  return {
    id: raw._id ? raw._id.toString() : raw.id ? raw.id.toString() : undefined,
    name: raw.name,
    email: raw.email,
    phone: raw.phone || null,
    role: raw.role,
    isActive: Boolean(raw.isActive),
    isEmailVerified: Boolean(raw.isEmailVerified),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
};

export default toSafeUser;
