// @ts-check

/**
 *  We really only need three log levels
 * * Error
 * * Info
 * * Verbose
 * For the purposes of minimal refactor, I'm aliasing debug() to verbose()
 * I'm also mapping the log() options to the new calls and
 * deprecating log()
 */

function _getTimestamp() {
  return new Date().toISOString()
}

/**
 * @deprecated - Please use error(), info(), or verbose()
 * @param {string} message
 * @param {Object} [options]
 * @param {string} [options.level]
 * @param {Object} [options.args]
 * @param {boolean} [options.args.verbose]
 * @returns void
 */
function log(message, options) {
  if (!options || !options.level) {
    return logInfo(message)
  }
  switch (options.level) {
    case 'debug':
      if (options.args && options.args.verbose) {
        return logVerbose(message, true)
      }

      break
    case 'error':
      return logError(message)
    default:
      return logInfo(message)
  }
}

/**
 *
 * @param {string} message - message to log
 * @param {boolean} shouldVerbose - pass the value of the verbose flag
 * @return void
 */
function logVerbose(message, shouldVerbose = false) {
  if (shouldVerbose === true) {
    console.debug(`[${_getTimestamp()}] ['verbose'] ${message}`)
  }
}

/**
 *
 * @param {string} message - message to log
 * @return void
 */
function logError(message) {
  console.error(`[${_getTimestamp()}] ['error'] ${message}`)
}

/**
 *
 * @param {string} message - message to log
 * @return void
 */
function logInfo(message) {
  console.log(`[${_getTimestamp()}] ['info'] ${message}`)
}

module.exports = {
  logError: logError,
  logInfo: logInfo,
  log,
  logVerbose: logVerbose,
}
