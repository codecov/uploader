var validator = require("validator");

function validateToken(token) {
  return validator.isAlphanumeric(token);
}

function validateURL(url) {
  return validator.isURL(url, { require_protocol: true });
}

function validateFlags(flags) {
  mask = /^[w,]+$/;
  return flags.match(mask);
}

module.exports = {
  validateToken,
  validateURL,
  validateFlags
};
