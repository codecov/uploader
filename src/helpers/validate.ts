import validator from 'validator'
import { UploaderArgs } from '../types'

/**
 *
 * @param {string} token
 * @returns boolean
 */
export function validateToken(token: string): boolean {
  // TODO: this should be refactored to check against format and length
  return validator.isAlphanumeric(token) || validator.isUUID(token)
}

export function validateURL(url: string): boolean {
  return validator.isURL(url, { require_protocol: true })
}

export function validateFlags(flags: string): boolean {
  // eslint-disable-next-line no-useless-escape
  const mask = /^[\w\.\-]{1,45}$/
  return mask.test(flags)
}

export function validateFileNamePath(path: string): boolean {
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

export function validateSHA(
  commitSHA: string,
  requestedLength = GIT_SHA_LENGTH,
): boolean {
  return (
    commitSHA.length === requestedLength && validator.isAlphanumeric(commitSHA)
  )
}

export function checkValueType(
  name: string,
  value: unknown,
  type: string,
): void {
  if (typeof value !== type) {
    throw new Error(
      `The value of ${name} is not of type ${type}, can not continue, please review: ${value}`,
    )
  }
}
