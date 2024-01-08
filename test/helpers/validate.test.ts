import * as validate from '../../src/helpers/validate'

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

    it('Should pass with a long name and special characters', () => {
      expect(validate.isValidFlag('uu-thisnameis-ridculouslylong-javascrip-but-thisisareally-longnamethatisgoing-tobe-supported-withmanymanycharacters-andthisflagname-istoolongto-dispaly-intheui1234567891011121314151617181920212222324252627282829201212-thisnameis$%#%&^')).toBe(true)
    })

    it('Should throw with a name longer than 1024 characters', () => {
      expect(validate.isValidFlag('uu-thisnameis-ridculouslylong-javascrip-but-thisisareally-longnamethatisgoing-tobe-supported-withmanymanycharacters-andthisflagname-istoolongto-dispaly-intheui1234567891011121314151617181920212222324252627282829201212-thisnameis$%#%&^uu-thisnameis-ridculouslylong-javascrip-but-thisisareally-longnamethatisgoing-tobe-supported-withmanymanycharacters-andthisflagname-istoolongto-dispaly-intheui1234567891011121314151617181920212222324252627282829201212-thisnameis$%#%&^uu-thisnameis-ridculouslylong-javascrip-but-thisisareally-longnamethatisgoing-tobe-supported-withmanymanycharacters-andthisflagname-istoolongto-dispaly-intheui1234567891011121314151617181920212222324252627282829201212-thisnameis$%#%&^uu-thisnameis-ridculouslylong-javascrip-but-thisisareally-longnamethatisgoing-tobe-supported-withmanymanycharacters-andthisflagname-istoolongto-dispaly-intheui1234567891011121314151617181920212222324252627282829201212-thisnameis$%#%&^uu-thisnameis-ridculouslylong-javascrip-but-thisisareally-longnamethatisgoing-tobe-supported-withmanymanycharacters-andthisflagname-istoolongto-dispaly-intheui1234567891011121314151617181920212222324252627282829201212-thisnameis$%#%&^uu-thisnameis-ridculouslylong-javascrip-but-thisisareally-longnamethatisgoing-tobe-supported-withmanymanycharacters-andthisflagname-istoolongto-dispaly-intheui1234567891011121314151617181920212222324252627282829201212-thisnameis$%#%&^')).toBe(false)
    })

    it("should throw when they they not match the pattern", () => {
      // arrange
      const invalidFlagName = "flag'subflag"

      const expectedErrorMessage = "Flags cannot contain the ' or \" characters and cannot exceed 1024 characters. Received flag'subflag"
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

  describe('checkSlug()', () => {
    it('should return true for a slug with a forward slash', () => {
      // arrange
      const inputSlug = "testOrg/testRepo"
      const expectedResult = true

      // act
      const result = validate.checkSlug(inputSlug)

      // assert
      expect(result).toEqual(expectedResult)
    })

    it('should return false for a slug without a forward slash', () => {
      // arrange
      const inputSlug = 'testRepo'
      const expectedResult = false

      // act
      const result = validate.checkSlug(inputSlug)

      // assert
      expect(result).toEqual(expectedResult)
    })
  })
})
