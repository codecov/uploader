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
 *
 * @param {string} message - message to log
 * @param {boolean} shouldVerbose - pass the value of the verbose flag
 * @return void
 */
export function verbose(message: string, shouldVerbose = false) {
  if (shouldVerbose === true) {
    console.debug(`[${_getTimestamp()}] ['verbose'] ${message}`)
  }
}

/**
 *
 * @param {string} message - message to log
 * @return void
 */
export function logError(message: string) {
  console.error(`[${_getTimestamp()}] ['error'] ${message}`)
}

/**
 *
 * @param {string} message - message to log
 * @return void
 */
export function info(message: string) {
  console.log(`[${_getTimestamp()}] ['info'] ${message}`)
}
