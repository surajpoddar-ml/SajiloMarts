export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(email).toLowerCase());
};

export const isValidNepalPhone = (phone) => {
  const nepalRegex = /^(?:\+977[- ]?)?(?:98|97)\d{8}$/;
  return nepalRegex.test(String(phone).trim());
};

export const isValidIndiaPhone = (phone) => {
  const indiaRegex = /^(?:\+91[- ]?)?[6-9]\d{9}$/;
  return indiaRegex.test(String(phone).trim());
};
