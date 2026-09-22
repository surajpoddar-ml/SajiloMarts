/**
 * Centrally normalizes an email address.
 * Strips surrounding whitespace and converts to lower case.
 *
 * @param {string} email
 * @returns {string} Normalized email string
 */
export const normalizeEmail = (email) => {
  if (typeof email !== 'string') return '';
  return email.trim().toLowerCase();
};

export default normalizeEmail;
