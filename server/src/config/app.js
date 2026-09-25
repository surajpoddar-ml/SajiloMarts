export const appConfig = {
  bodyLimit: '16kb',
  defaultPage: 1,
  defaultLimit: 20,
  maxLimit: 100,
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 100,
  },
  supportEmail: process.env.SUPPORT_EMAIL || 'sajilomarts@gmail.com',
  instagramUrl: process.env.INSTAGRAM_URL || 'https://www.instagram.com/sajilomarts',
};
