var validator = require("validator");

function validateToken(token) {
  return validator.isAlphanumeric(token);
}

function validateURL(url) {
  return validator.isURL(url, { require_protocol: true });
}

module.exports = {
  validateToken,
  validateURL
};
