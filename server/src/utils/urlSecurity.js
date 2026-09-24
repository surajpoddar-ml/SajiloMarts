import { BadRequestError } from './badRequestError.js';

/**
 * List of private, loopback, and internal IPv4 / IPv6 addresses and hostnames.
 */
const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
  /^0\.0\.0\.0$/,
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
  /^192\.168\.\d{1,3}\.\d{1,3}$/,
  /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/,
  /^169\.254\.\d{1,3}\.\d{1,3}$/, // link-local
  /^::1$/,
  /^fe80:/i,
  /^fc00:/i,
  /\.local$/i,
  /\.internal$/i,
  /\.lan$/i,
  /\.corp$/i,
];

/**
 * Common non-standard ports that should be blocked for product sourcing URLs.
 */
const ALLOWED_PORTS = new Set(['', '80', '443']);

/**
 * Tracking query parameter keys to strip during normalization.
 */
const TRACKING_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'ref',
  'ref_',
  'tag',
  'fbclid',
  'gclid',
  'gclsrc',
  'dclid',
  'zanpid',
  'msclkid',
  '_hsenc',
  '_hsmi',
  'mc_cid',
  'mc_eid',
];

/**
 * Validates and normalizes product URLs from Indian marketplaces.
 * Protects against SSRF, internal network scanning, unsupported protocols, and tracking bloat.
 *
 * @param {string} rawUrl - Submitted product URL
 * @returns {string} - Clean, normalized HTTPS URL
 * @throws {BadRequestError} - If URL is invalid, unsafe, or uses disallowed protocols/hosts
 */
export const normalizeProductUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
    throw new BadRequestError('Product URL is required and must be a valid string');
  }

  const trimmed = rawUrl.trim();
  if (trimmed.length > 2000) {
    throw new BadRequestError('Product URL exceeds maximum length of 2000 characters');
  }

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new BadRequestError('Invalid product URL format');
  }

  // Enforce HTTP / HTTPS protocol
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new BadRequestError('Only HTTP and HTTPS URLs are supported');
  }

  const hostname = parsed.hostname.toLowerCase();

  // Enforce allowed ports
  if (!ALLOWED_PORTS.has(parsed.port)) {
    throw new BadRequestError('Invalid or unsupported network port in product URL');
  }

  // Check against SSRF / private network hosts
  for (const pattern of PRIVATE_HOST_PATTERNS) {
    if (pattern.test(hostname)) {
      throw new BadRequestError('Product URL points to an invalid or restricted private network address');
    }
  }

  // Must contain a valid TLD dot
  if (!hostname.includes('.')) {
    throw new BadRequestError('Product URL must contain a valid domain hostname');
  }

  // Strip tracking parameters
  for (const param of TRACKING_PARAMS) {
    parsed.searchParams.delete(param);
  }

  // Clean empty hash or useless fragments if empty
  parsed.hash = '';

  // Return normalized URL string
  return parsed.toString();
};

export default {
  normalizeProductUrl,
};
