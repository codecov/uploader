const validator = require('validator')

function validateToken(token) {
  return validator.isAlphanumeric(token)
}

function validateURL(url) {
  return validator.isURL(url, { require_protocol: true })
}

function validateFlags(flags) {
  // eslint-disable-next-line no-useless-escape
  const mask = /^[\w\.\-]{1,45}$/
  return mask.test(flags)
}

function validateFileNamePath(path) {
  const mask = /^[\w/.,-]+$/
  return mask.test(path)
}

/**
 * Validate that a SHA is the correct length and content
 * @param {string} commitSHA
 * @param {number} requestedLength
 * @returns {boolean}
 */
function validateSHA(commitSHA, requestedLength) {
  return (
    commitSHA.length === requestedLength && validator.isAlphanumeric(commitSHA)
  )
}

module.exports = {
  validateToken,
  validateURL,
  validateFlags,
  validateFileNamePath,
  validateSHA,
}
