/**
 * SajiloMarts Form Validation & Input State Helpers
 */

export const validateRequired = (value, fieldName = 'This field') => {
  if (value === undefined || value === null || String(value).trim() === '') {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateProductUrl = (url) => {
  if (!url || !String(url).trim()) {
    return 'Product URL is required';
  }

  try {
    const parsed = new URL(url.trim());
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return 'URL must begin with http:// or https://';
    }
    const hostname = parsed.hostname.toLowerCase();
    const isSupported = [
      'amazon.in',
      'flipkart.com',
      'myntra.com',
      'ajio.com',
      'nykaa.com',
      'tatacliq.com',
      'meesho.com',
    ].some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));

    if (!isSupported) {
      return 'Please enter a valid Indian marketplace URL (e.g., amazon.in, flipkart.com, myntra.com)';
    }

    return null;
  } catch {
    return 'Please enter a valid URL address';
  }
};

export const validateEmail = (email) => {
  if (!email || !String(email).trim()) {
    return 'Email address is required';
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address';
  }
  return null;
};
