const validate = require('../../src/helpers/validate')

describe('Input Validators', function () {
  describe('Tokens', function () {
    it('Returns true with a valid token', function () {
      expect(validate.validateToken('1bc123')).toBe(true)
    })
    it('Returns false with an invalid token', function () {
      expect(validate.validateToken('1bc1 23')).toBe(false)
    })
  })

  describe('Flags', function () {
    it('Should fail with a dash', function () {
      expect(validate.validateFlags('moo-foor')).toBe(false)
    })
  })

  describe('URLs', function () {
    it('Returns true with a valid URL', function () {
      expect(validate.validateURL('https://codecov.io')).toBe(true)
    })
    it('Returns false with an invalid URL', function () {
      expect(validate.validateURL('not.a.URL.com')).toBe(false)
    })
    it('Returns false with an empty URL', function () {
      expect(validate.validateURL('')).toBe(false)
    })
  })
})
