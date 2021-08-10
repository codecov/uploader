import { logError } from './logger'

/**
 * Log the error and throw it
 * @param {string} message
 * @throws Error
 */
export function logAndThrow(message: string): never {
  logError(message)
  throw new Error(message)
}
