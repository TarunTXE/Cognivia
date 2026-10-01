/**
 * Consistent JSON response helpers.
 * Every controller uses these so the response shape is always predictable.
 */

/**
 * Send a successful response.
 * @param {import('express').Response} res
 * @param {*} data  - payload to send under the `data` key
 * @param {number} [status=200]
 */
function success(res, data, status = 200) {
  return res.status(status).json({
    success: true,
    data,
  });
}

/**
 * Send an error response.
 * @param {import('express').Response} res
 * @param {string} message  - human-readable error description
 * @param {number} [status=500]
 * @param {*}      [details] - optional extra context (validation errors, etc.)
 */
function error(res, message, status = 500, details = null) {
  const body = { success: false, error: message };
  if (details !== null) body.details = details;
  return res.status(status).json(body);
}

module.exports = { success, error };
