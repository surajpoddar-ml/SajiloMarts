export const API_ENDPOINTS = {
  HEALTH: '/health',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH_TOKEN: '/auth/refresh-token',
  },
  PRODUCTS: {
    BASE: '/products',
    DETAILS: (id) => `/products/${id}`,
    CATEGORIES: '/products/categories',
    FEATURED: '/products/featured',
  },
  QUOTES: {
    BASE: '/quotes',
    DETAILS: (id) => `/quotes/${id}`,
    SUBMIT: '/quotes/request',
  },
  CART: {
    BASE: '/cart',
    SYNC: '/cart/sync',
  },
  ORDERS: {
    BASE: '/orders',
    DETAILS: (id) => `/orders/${id}`,
    TRACK: (trackingNumber) => `/orders/track/${trackingNumber}`,
  },
  USER: {
    PROFILE: '/users/profile',
    ADDRESSES: '/users/addresses',
    WISHLIST: '/users/wishlist',
  },
  ADMIN: {
    METRICS: '/admin/metrics',
    ORDERS: '/admin/orders',
    PRODUCTS: '/admin/products',
    QUOTES: '/admin/quotes',
  },
};
