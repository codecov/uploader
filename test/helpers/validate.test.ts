import * as validate from '../../src/helpers/validate'
import { checkValueType } from '../../src/helpers/validate'

// Backup the env
const realEnv = { ...process.env }

describe('Input Validators', () => {
  describe('checkValueType()', () => {
it('throws an error when the value is not the correct type', () => {
  expect(() => { checkValueType('testValue', {}, 'number')}).toThrowError(/The value of testValue is not of type number, can not continue, please review/)
})
  })

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
      expect(validate.validateFlags('moo')).toBe(true)
    })
    it('Should pass with a dash', () => {
      expect(validate.validateFlags('moo-foor')).toBe(true)
    })

    it('Should pass with a period in the middle', () => {
      expect(validate.validateFlags('moo.foor')).toBe(true)
    })

    it('Should pass with a dash at the start', () => {
      expect(validate.validateFlags('-moo-foor')).toBe(true)
    })
  })

  describe('FileNamePath', () => {
    it('Should pass with an absolute path', () => {
      expect(validate.validateFileNamePath('/path/to/file/1.txt')).toBe(true)
    })
    it('Should pass with a relative path', () => {
      expect(validate.validateFileNamePath('./path/to/file/1.txt')).toBe(true)
    })

    it('Should fail with spaces', () => {
      expect(validate.validateFileNamePath('/path to/file')).toBe(false)
    })
    it('Should fail with other characters', () => {
      expect(validate.validateFileNamePath('/path{}to/file')).toBe(false)
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

  describe('fetchToken()', () => {
    beforeEach(() => {
      delete process.env.CODECOV_TOKEN
    })

    afterEach(() => {
      process.env = realEnv
    })

    it('should return an empty string if neither args or env are set', () => {
      const args = { flags: '' }
      expect(validate.fetchToken(args)).toEqual('')
    })

    it('should return the value of the env if env is set, and args are not set', () => {
      process.env.CODECOV_TOKEN = 'testingEnvToken'
      const args = { flags: '' }
      expect(validate.fetchToken(args)).toEqual('testingEnvToken')
    })

    it('should return the value of the arg if env is set, and args are set', () => {
      process.env.CODECOV_TOKEN = 'testingEnvToken'
      const args = {
        token: 'testingArgToken',
        flags: '',
      }
      expect(validate.fetchToken(args)).toEqual('testingArgToken')
    })
  })
})
