/**
 * SastoMarts Form Validation & Input State Helpers
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
      '1mg.com',
    ].some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));

    if (!isSupported) {
      return 'Please enter a valid Indian marketplace URL (e.g., amazon.in, flipkart.com, myntra.com, meesho.com, 1mg.com)';
    }

    return null;
  } catch {
    return 'Please enter a valid URL address';
  }
};

export const detectMarketplace = (url) => {
  if (!url) return null;
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.toLowerCase();
    if (host.includes('amazon')) return { id: 'amazon', name: 'Amazon India', domain: 'amazon.in' };
    if (host.includes('flipkart')) return { id: 'flipkart', name: 'Flipkart', domain: 'flipkart.com' };
    if (host.includes('myntra')) return { id: 'myntra', name: 'Myntra', domain: 'myntra.com' };
    if (host.includes('meesho')) return { id: 'meesho', name: 'Meesho', domain: 'meesho.com' };
    if (host.includes('1mg')) return { id: '1mg', name: 'Tata 1mg', domain: '1mg.com' };
    if (host.includes('ajio')) return { id: 'ajio', name: 'AJIO', domain: 'ajio.com' };
    if (host.includes('nykaa')) return { id: 'nykaa', name: 'Nykaa', domain: 'nykaa.com' };
    if (host.includes('tatacliq')) return { id: 'tatacliq', name: 'Tata CLiQ', domain: 'tatacliq.com' };
    return { id: 'other', name: host, domain: host };
  } catch {
    return null;
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
