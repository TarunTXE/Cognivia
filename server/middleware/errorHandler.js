const { error } = require('../utils/response');

/**
 * Centralized error handler middleware.
 * Must be registered LAST, after all routes.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('[Error]', err.message || err);

  const status = err.status || err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production' && status === 500
      ? 'Internal server error'
      : err.message || 'Internal server error';

  return error(res, message, status);
}

module.exports = errorHandler;
