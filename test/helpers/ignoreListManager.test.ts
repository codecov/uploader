import { getEntries, resetEntries, getEntryCount, addEntry } from '../../src/helpers/ignoreListManager'

const defaultEntryCount = 107

describe('IgnoreListManager', () => {
    describe('getEntryCount()', () => {
        it(`should start at ${defaultEntryCount}`, () => {
            expect(getEntryCount()).toEqual(defaultEntryCount)
        })

        it('increases when a entry is added', () => {
            resetEntries()
            expect(getEntryCount()).toEqual(defaultEntryCount)
            addEntry('newEntry')
            expect(getEntryCount()).toEqual(defaultEntryCount + 1)
        })
    })

    describe('getEntries()', () => {
        it('should return a array of entries', () => {
            resetEntries()
            expect(getEntries()).toHaveLength(defaultEntryCount)
        })
    })
    
    describe('addEntry()', () => {
        resetEntries()
        it('should start not having newEntry', () => {
            expect(getEntries()).not.toContain('newEntry')
        })

        it('should contain newEntry after calling addEntry()', () => {
            addEntry('newEntry')
            expect(getEntries()).toContain('newEntry')
        })
    })
})