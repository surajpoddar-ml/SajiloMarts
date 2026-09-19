export const sanitizeInput = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete req.body[key];
      }
    }
  }
  next();
};
