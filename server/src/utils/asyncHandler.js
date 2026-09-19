export const asyncHandler = (requestHandler) => {
  if (typeof requestHandler !== 'function') {
    throw new TypeError('asyncHandler requires a middleware function argument');
  }

  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch(next);
  };
};
