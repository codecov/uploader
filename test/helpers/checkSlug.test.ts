import { checkSlug } from "../../src/helpers/checkSlug";

describe('checkSlug()', () => {
    it('should return true for a slug with a forward slash', () => {
        // arrange
        const inputSlug = "testOrg/testRepo"
        const expectedResult = true

        // act
        const result = checkSlug(inputSlug)

        // assert
        expect(result).toEqual(expectedResult)
    })

    it('should return false for a slug without a forward slash', () => {
        // arrange
        const inputSlug = 'testRepo'
        const expectedResult = false

        // act
        const result = checkSlug(inputSlug)

        // assert
        expect(result).toEqual(expectedResult)
    })
})
