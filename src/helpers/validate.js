var validator = require("validator");

function validateToken(token) {
  return validator.isAlphanumeric(token);
}

function validateURL(url) {
  return validator.isURL(url, { require_protocol: true });
}

function validateFlags(flags) {
  mask = /^[\w,]+$/;
  return mask.test(flags);
}

function validateFileNamePath(path) {
  mask = /^[\w,]+$/;
  return flags.test(mask);
}

module.exports = {
  validateToken,
  validateURL,
  validateFlags
};
