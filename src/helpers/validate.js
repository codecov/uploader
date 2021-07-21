const validator = require('validator')

/**
 *
 * @param {string} token
 * @returns boolean
 */
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
const GIT_SHA_LENGTH = 40

function validateSHA(commitSHA, requestedLength = GIT_SHA_LENGTH) {
  return (
    commitSHA.length === requestedLength && validator.isAlphanumeric(commitSHA)
  )
}

function getToken(args) {
  // Token gets set in the following order:
  // * args.token
  // * process.env.CODECOV_TOKEN
  // * ''
  let token = ''
  if (args.token && validateToken(args.token)) {
    token = args.token
  } else if (
    process.env.CODECOV_TOKEN &&
    validateToken(process.env.CODECOV_TOKEN)
  ) {
    token = process.env.CODECOV_TOKEN
  }
  return token
}

module.exports = {
  getToken,
  validateToken,
  validateURL,
  validateFlags,
  validateFileNamePath,
  validateSHA,
}
