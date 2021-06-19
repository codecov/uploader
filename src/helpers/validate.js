const validator = require('validator')

function validateToken(token) {
  return validator.isAlphanumeric(token)
}

function validateURL(url) {
  return validator.isURL(url, { require_protocol: true })
}

function validateFlags(flags) {
  const mask = /^[a-z0-9_\.\-]{1,45}$/
  return mask.test(flags)
}

function validateFileNamePath(path) {
  const mask = /^[\w/.,-]+$/
  return mask.test(path)
}

module.exports = {
  validateToken,
  validateURL,
  validateFlags,
  validateFileNamePath,
}
