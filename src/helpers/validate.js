var validator = require("validator");

function validateToken(token) {
  return validator.isAlphanumeric(token);
}

module.exports = {
  validateToken
};
