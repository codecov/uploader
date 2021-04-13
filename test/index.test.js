const app = require('../src')

const { version } = require('../package.json')

describe('Uploader Core', function () {
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

  Codecov report uploader 0.1.0`)
  })
})
