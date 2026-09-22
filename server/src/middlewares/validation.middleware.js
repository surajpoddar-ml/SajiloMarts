/**
 * Higher-order middleware factory that executes a validation function on req.body.
 *
 * @param {Function} validatorFn - Function that validates and returns sanitized data, or throws ValidationError
 * @returns {import('express').RequestHandler}
 */
export const validateBody = (validatorFn) => {
  return (req, res, next) => {
    try {
      req.body = validatorFn(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default validateBody;
