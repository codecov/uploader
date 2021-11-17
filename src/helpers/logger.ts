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
export function verbose(message: string, shouldVerbose = false): void {
  if (shouldVerbose === true) {
    console.debug(`[${_getTimestamp()}] ['verbose'] ${message}`)
  }
}

/**
 *
 * @param {string} message - message to log
 * @return void
 */
export function logError(message: string): void {
  console.error(`[${_getTimestamp()}] ['error'] ${message}`)
}

/**
 *
 * @param {string} message - message to log
 * @return void
 */
export function info(message: string): void {
  console.log(`[${_getTimestamp()}] ['info'] ${message}`)
}

export class UploadLogger {
  private static _instance: UploadLogger
  logLevel = 'info'
  
  private constructor() {
    // Intentionally empty
  }

  static init() {
    if (!UploadLogger._instance) {
      UploadLogger._instance = new UploadLogger()
    }
  }

  static setLogLevel(level: string) {
    UploadLogger.init()
    UploadLogger._instance.logLevel = level
  }

  static verbose(message: string) {
    UploadLogger.init()
    if (UploadLogger._instance.logLevel === 'verbose') {
      console.log(`[${_getTimestamp()}] ['verbose'] ${message}`)
    }
  }
}