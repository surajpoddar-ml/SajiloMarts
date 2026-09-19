export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage unavailable or quota exceeded
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore removal error
    }
  },

  clear: () => {
    try {
      localStorage.clear();
    } catch {
      // Ignore clear error
    }
  },
};
