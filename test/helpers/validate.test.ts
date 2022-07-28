import * as validate from '../../src/helpers/validate'
import { DEFAULT_UPLOAD_HOST } from '../../src/helpers/constansts'
import Module from 'module'

// Backup the env
const realEnv = { ...process.env }

describe('Input Validators', () => {
  describe('Tokens', () => {
    it('Returns true with a valid alphanumeric token', () => {
      expect(validate.validateToken('1bc123')).toBe(true)
    })
    it('Returns true with a valid UUID token', () => {
      // Use a randomly generated UUIDv4
      expect(
        validate.validateToken('5becd1a9-efa8-4bd8-8f94-e9f8613820c3'),
      ).toBe(true)
    })
    it('Returns false with an invalid token', () => {
      expect(validate.validateToken('1bc1 23')).toBe(false)
    })
  })

  describe('URLs', () => {
    it('Returns true with a valid URL', () => {
      expect(validate.validateURL('https://codecov.io')).toBe(true)
    })
    it('Returns false with an invalid URL', () => {
      expect(validate.validateURL('not.a.URL.com')).toBe(false)
    })
    it('Returns false with an empty URL', () => {
      expect(validate.validateURL('')).toBe(false)
    })
  })

  describe('Flags', () => {
    it('Should pass without a dash', () => {
      expect(validate.isValidFlag('moo')).toBe(true)
    })
    it('Should pass with a dash', () => {
      expect(validate.isValidFlag('moo-foor')).toBe(true)
    })

    it('Should pass with a period in the middle', () => {
      expect(validate.isValidFlag('moo.foor')).toBe(true)
    })

    it('Should pass with a dash at the start', () => {
      expect(validate.isValidFlag('-moo-foor')).toBe(true)
    })

    it("should throw when they they not match the pattern", () => {
      // arrange
      const invalidFlagName = "flag/subflag"
      const expectedErrorMessage = "Flags must consist only of alphanumeric characters, '_', '-', or '.' and not exceed 45 characters. Received flag/subflag"

      // act
      expect(() => validate.validateFlags([invalidFlagName])).toThrowError(expectedErrorMessage)
    })
  })

  describe('validateSHA()', () => {
    it('should fail with invalid characters', () => {
      expect(validate.validateSHA('abc 123', 7)).toBe(false)
    })
    it('should fail with incorrect length', () => {
      expect(validate.validateSHA('abc123', 7)).toBe(false)
    })
    it('should pass with correct content and length', () => {
      expect(validate.validateSHA('abc123', 6)).toBe(true)
    })

    it('should pass with correct content and default length', () => {
      expect(
        validate.validateSHA('1732d84b7ef2425e979d6034a3e3bb5633da344a'),
      ).toBe(true)
    })
  })
})
