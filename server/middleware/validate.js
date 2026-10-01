const { error } = require('../utils/response');

/**
 * Returns an Express middleware that validates `req.body` against a rules map.
 *
 * Rules map shape:
 *   { fieldName: { required?, type?, allowedValues? } }
 *
 * @param {Object} rules
 * @returns {import('express').RequestHandler}
 */
function validate(rules) {
  return (req, res, next) => {
    const issues = [];

    for (const [field, opts] of Object.entries(rules)) {
      const value = req.body[field];
      const isEmpty =
        value === undefined || value === null || String(value).trim() === '';

      // required check
      if (opts.required && isEmpty) {
        issues.push(`'${field}' is required`);
        continue; // skip further checks for this field
      }

      // skip optional fields that weren't supplied
      if (isEmpty) continue;

      // type check (string / number / array)
      if (opts.type) {
        if (opts.type === 'array' && !Array.isArray(value)) {
          issues.push(`'${field}' must be an array`);
        } else if (opts.type !== 'array' && typeof value !== opts.type) {
          issues.push(`'${field}' must be a ${opts.type}`);
        }
      }

      // allowedValues check
      if (opts.allowedValues && !opts.allowedValues.includes(value)) {
        issues.push(
          `'${field}' must be one of: ${opts.allowedValues.join(', ')}`
        );
      }

      // min / max for numbers
      if (opts.type === 'number' || typeof value === 'number') {
        if (opts.min !== undefined && value < opts.min)
          issues.push(`'${field}' must be at least ${opts.min}`);
        if (opts.max !== undefined && value > opts.max)
          issues.push(`'${field}' must be at most ${opts.max}`);
      }
    }

    if (issues.length > 0) {
      return error(res, 'Validation failed', 400, issues);
    }

    next();
  };
}

module.exports = validate;
