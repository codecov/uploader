const validate = require('../../src/helpers/validate')

describe('Input Validators', () => {
  describe('Tokens', () => {
    it('Returns true with a valid token', () => {
      expect(validate.validateToken('1bc123')).toBe(true)
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

    it('Should fail with a dash at the start', () => {
      expect(validate.validateFlags('-moo-foor')).toBe(false)
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
})
