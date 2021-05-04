const app = require('../src')

const { version } = require('../package.json')
const nock = require('nock')

describe('Uploader Core', function () {
  const env = process.env

  afterEach(() => {
    process.env = env
  })

  it('Can return version', function () {
    expect(app.getVersion()).toBe(version)
  })

  it('Can display header', function () {
    expect(app.generateHeader(app.getVersion())).toBe(`
     _____          _
    / ____|        | |
   | |     ___   __| | ___  ___ _____   __
   | |    / _ \\ / _\` |/ _ \\/ __/ _ \\ \\ / /
   | |___| (_) | (_| |  __/ (_| (_) \\ V /
    \\_____\\___/ \\__,_|\\___|\\___\\___/ \\_/

  Codecov report uploader ${version}`)
  })

  it('Can upload with custom name', async function () {
    process.env.CI = 'true'
    process.env.CIRCLECI = 'true'

    nock('https://codecov.io')
      .post('/upload/v4')
      .query(actualQueryObject => actualQueryObject.name === 'customname')
      .reply(200, 'https://results.codecov.io\nhttps://codecov.io')

    nock('https://codecov.io')
      .put('/')
      .reply(200, 'success')

    const result = await app.main({
      name: 'customname',
      token: 'abcdefg',
      url: 'https://codecov.io'
    })
    expect(result).toEqual({ status: 'success', resultURL: 'https://results.codecov.io' })
  }, 30000)
})
