const ApiError = require('../utils/ApiError');

/**
 * Runs a Zod schema against { body, params, query } and rejects with a
 * uniform 400 before the request ever reaches a controller. Schemas only
 * need to declare the slices they care about (see auth.validator.js).
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      path: issue.path.slice(1).join('.'), // drop the leading body/params/query segment
      message: issue.message,
    }));
    return next(ApiError.badRequest('Validation failed', errors));
  }

  // Overwrite with parsed (and coerced/defaulted) values.
  if (result.data.body) req.body = result.data.body;
  if (result.data.params) req.params = result.data.params;
  if (result.data.query) req.query = result.data.query;

  next();
};

module.exports = validate;
