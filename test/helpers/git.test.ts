import { parseSlug } from '../../src/helpers/git'

describe('Git Helper', () => {
  it('should be able to parse http urls', () => {
    const remoteAddr = 'http://github.com/codecov/uploader.git'
    expect(parseSlug(remoteAddr)).toBe('codecov/uploader')
  })

  it('should be able to parse https urls', () => {
    const remoteAddr = 'https://github.com/codecov/uploader.git'
    expect(parseSlug(remoteAddr)).toBe('codecov/uploader')
  })

  it('should be able to parse ssh urls', () => {
    const remoteAddr = 'ssh://git@github.com/codecov/uploader.git'
    expect(parseSlug(remoteAddr)).toBe('codecov/uploader')
  })

  it('should be able to parse short form ssh urls', () => {
    const remoteAddr = 'git@github.com:codecov/uploader.git'
    expect(parseSlug(remoteAddr)).toBe('codecov/uploader')
  })

  it('doesn\'t error with malformed http urls', () => {
    const remoteAddr = 'http://github.com/codecov'
    expect(parseSlug(remoteAddr)).toBe('')
  })

  it('doesn\'t error with malformed short ssh urls', () => {
    const remoteAddr = 'git@github.com/abcd'
    expect(parseSlug(remoteAddr)).toBe('')
  })

  it('errors with unexpected addr', () => {
    expect(() => { parseSlug('test non remoteAddr') }).toThrowError(/Unable to parse slug URL/)
  })
})
