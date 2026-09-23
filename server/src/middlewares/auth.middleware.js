import { User } from '../models/user.model.js';
import { AUTH_COOKIE_NAME, AUTH_ERRORS } from '../constants/auth.constants.js';
import { UnauthorizedError, verifyToken, toSafeUser } from '../utils/index.js';

/**
 * Middleware that authenticates incoming HTTP requests via HTTP-only cookie or Bearer header.
 * Attaches sanitized user profile to `req.user` and verifies active account status.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const requireAuth = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check HTTP-only cookie
    if (req.cookies && req.cookies[AUTH_COOKIE_NAME]) {
      token = req.cookies[AUTH_COOKIE_NAME];
    }

    // 2. Check Authorization header fallback
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
        token = parts[1];
      }
    }

    if (!token) {
      throw new UnauthorizedError(AUTH_ERRORS.UNAUTHENTICATED);
    }

    // 3. Verify JWT token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      throw new UnauthorizedError(AUTH_ERRORS.INVALID_TOKEN);
    }

    if (!decoded || !decoded.userId) {
      throw new UnauthorizedError(AUTH_ERRORS.INVALID_TOKEN);
    }

    // 4. Resolve user from database
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new UnauthorizedError(AUTH_ERRORS.UNAUTHENTICATED);
    }

    // 5. Verify account is active
    if (!user.isActive) {
      throw new UnauthorizedError(AUTH_ERRORS.ACCOUNT_DEACTIVATED);
    }

    // 6. Enforce session revocation if password was modified after token was issued
    if (user.passwordChangedAt && decoded.iat) {
      const passwordChangedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
      if (decoded.iat < passwordChangedTimestamp) {
        throw new UnauthorizedError('Password was recently changed. Please log in again.');
      }
    }

    // 7. Attach safe authenticated user context
    req.user = toSafeUser(user);
    req.userId = user._id.toString();
    req.userRole = user.role;

    next();
  } catch (error) {
    next(error);
  }
};

export default requireAuth;
