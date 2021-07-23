const { logError: error } = require('./logger')

/**
 * Log the error and throw it
 * @param {string} message
 * @throws Error
 */
function logAndThrow(message) {
  error(message)
  throw new Error(message)
}

module.exports = {
  logAndThrow,
}
