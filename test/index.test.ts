import Module from 'module'

import * as app from '../src'

import childProcess from 'child_process'
import fs from 'fs'
import nock from 'nock'
import td from 'testdouble'
import { UploadLogger } from '../src/helpers/logger'
import { version } from '../package.json'

// Backup the env
const realEnv = { ...process.env }

describe('Uploader Core', () => {
  const env = process.env

  UploadLogger.setLogLevel('verbose')

  beforeEach(() => {
    // https://bensmithgall.com/blog/jest-mock-trick if this works!
    const mockExit = jest.fn()
    function mockProcess() {
      const original = Module.createRequire('process')
      return { ...original, exit: mockExit }
    }

    jest.mock('process', () => mockProcess())
    jest.resetAllMocks()
  })

  afterEach(() => {
    process.env = env
    jest.restoreAllMocks()
    td.reset()
  })

  it('Can return version', () => {
    expect(app.getVersion()).toBe(version)
  })

  it('Can display header', () => {
    expect(app.generateHeader(app.getVersion())).toBe(`
     _____          _
    / ____|        | |
   | |     ___   __| | ___  ___ _____   __
   | |    / _ \\ / _\` |/ _ \\/ __/ _ \\ \\ / /
   | |___| (_) | (_| |  __/ (_| (_) \\ V /
    \\_____\\___/ \\__,_|\\___|\\___\\___/ \\_/

  Codecov report uploader ${version}`)
  })

  it('Can upload with custom name', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {
      // intentionally empty
    })
    process.env.CI = 'true'
    process.env.CIRCLECI = 'true'

    nock('https://codecov.io')
      .post('/upload/v4')
      .query(parsedObj => parsedObj.name === 'customname')
      .reply(200, 'https://results.codecov.io\nhttps://codecov.io')

    nock('https://codecov.io').put('/').reply(200, 'success')

    const result = await app.main({
      name: 'customname',
      token: 'abcdefg',
      url: 'https://codecov.io',
      flags: '',
      slug: '',
      upstream: ''
    })
    expect(result).toEqual({
      status: 'success',
      resultURL: 'https://results.codecov.io/',
    })
  }, 30000)

  it('Can parse environment variables', async () => {
    process.env.SOMETHING = 'red'
    process.env.ANOTHER = 'blue'
    jest.spyOn(process, 'exit')
    const log = jest.spyOn(console, 'log').mockImplementation(() => {
      // intentionally empty
    })
    await app.main({
      name: 'customname',
      token: 'abcdefg',
      url: 'https://codecov.io',
      dryRun: 'true',
      env: 'SOMETHING,ANOTHER',
      flags: '',
      slug: '',
      upstream: ''
    })
    expect(log).toHaveBeenCalledWith(expect.stringMatching(/SOMETHING=red/))
    expect(log).toHaveBeenCalledWith(expect.stringMatching(/ANOTHER=blue/))
    expect(log).toHaveBeenCalledWith(expect.stringMatching(/<<<<<< ENV/))
  })

  describe('Token', () => {
    beforeEach(() => {
      delete process.env.CODECOV_TOKEN
    })

    afterEach(() => {
      process.env = realEnv
      jest.clearAllMocks()
    })

    it('Can upload without token', async () => {
      jest.spyOn(process, 'exit')
      const log = jest.spyOn(console, 'log').mockImplementation(() => {
        // intentionally empty
      })
      await app.main({
        name: 'customname',
        url: 'https://codecov.io',
        dryRun: 'true',
        env: 'SOMETHING,ANOTHER',
        flags: '',
        slug: '',
        upstream: ''
      })
      expect(log).toHaveBeenCalledWith(
        expect.stringMatching('-> No token specified or token is empty'),
      )
    })
  })

  describe('Flags', () => {
    it('can upload with flags', async () => {
      process.env.CI = 'true'
      process.env.CIRCLECI = 'true'

      nock('https://codecov.io')
        .post('/upload/v4')
        .query(actualQueryObject => actualQueryObject.flags === 'a-flag')
        .reply(200, 'https://results.codecov.io\nhttps://codecov.io')

      nock('https://codecov.io').put('/').reply(200, 'success')

      const result = await app.main({
        flags: 'a-flag',
        token: 'abcdefg',
        url: 'https://codecov.io',
        tag: '',
        source: '',
        slug: '',
        upstream: ''
      })
      expect(result).toEqual({
        status: 'success',
        resultURL: 'https://results.codecov.io/',
      })
    }, 30000)
  })

  it('Can upload with parent sha', async () => {
    process.env.CI = 'true'
    process.env.CIRCLECI = 'true'

    const parent = '2x4bqz123abc'

    nock('https://codecov.io')
      .post('/upload/v4')
      .query(actualQueryObject => actualQueryObject.parent === parent)
      .reply(200, 'https://results.codecov.io\nhttps://codecov.io')

    nock('https://codecov.io').put('/').reply(200, 'success')

    const result = await app.main({
      token: 'abcdefg',
      url: 'https://codecov.io',
      parent,
      flags: '',
      slug: '',
      upstream: ''
    })
    expect(result).toEqual({
      status: 'success',
      resultURL: 'https://results.codecov.io/',
    })
  }, 30000)

  it('Can find all coverage from root dir', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {
      // intentionally empty
    })
    await app.main({
      dryRun: 'true',
      name: 'customname',
      token: 'abcdefg',
      url: 'https://codecov.io',
      flags: '',
      slug: '',
      upstream: ''
    })
    expect(log).toHaveBeenCalledWith(
      expect.stringMatching(/An example coverage root file/),
    )
    expect(log).toHaveBeenCalledWith(
      expect.stringMatching(/An example coverage other file/),
    )
  })

  it('Can find a single specified file', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {
      // intentionally empty
    })
    await app.main({
      dryRun: 'true',
      file: 'test/fixtures/coverage.txt',
      name: 'customname',
      token: 'abcdefg',
      url: 'https://codecov.io',
      flags: '',
      slug: '',
      upstream: ''
    })
    expect(log).toHaveBeenCalledWith(
      expect.stringMatching(/Processing.*test\/fixtures\/coverage\.txt\.\.\./),
    )
  })

  it('Can find only the single specifed file', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {
      // intentionally empty
    })
    await app.main({
      dryRun: 'true',
      file: 'test/fixtures/coverage.txt',
      feature: 'search',
      name: 'customname',
      token: 'abcdefg',
      url: 'https://codecov.io',
      flags: '',
      slug: '',
      upstream: ''
    })
    expect(log).toHaveBeenCalledWith(
      expect.stringMatching(/Processing.*test\/fixtures\/coverage\.txt\.\.\./),
    )
    expect(log).not.toHaveBeenCalledWith(
      expect.stringMatching(/An example coverage other file/),
    )
  })

  it('Can find multiple specified files', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {
      // intentionally empty
    })
    await app.main({
      dryRun: 'true',
      file: [
        'test/fixtures/coverage.txt',
        'test/fixtures/other/coverage.txt',
        'test/does/not/exist.txt',
      ],
      name: 'customname',
      token: 'abcdefg',
      url: 'https://codecov.io',
      flags: '',
      slug: '',
      upstream: ''
    })
    expect(log).toHaveBeenCalledWith(
      expect.stringMatching(/Processing.*test\/fixtures\/coverage\.txt\.\.\./),
    )
    expect(log).toHaveBeenCalledWith(
      expect.stringMatching(/Processing.*test\/fixtures\/other\/coverage\.txt\.\.\./),
    )
    expect(log).not.toHaveBeenCalledWith(
      expect.stringMatching(/Processing.*test\/does\/not\/exist\.txt\.\.\./),
    )
  })

  it('will process blocked files, if passed via -f', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {
      // intentionally empty
    })
    await app.main({
      dryRun: 'true',
      file: [
        'test/fixtures/.coverage',
      ],
      name: 'customname',
      token: 'abcdefg',
      url: 'https://codecov.io',
      flags: '',
      slug: '',
      upstream: ''
    })
    expect(log).toHaveBeenCalledWith(
      expect.stringMatching(/Processing.*test\/fixtures\/\.coverage\.\.\./),
    )
  })

  it('will process blocked files, if passed via -f and search is disabled', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {
      // intentionally empty
    })
    await app.main({
      dryRun: 'true',
      file: [
        'test/fixtures/.coverage',
      ],
      name: 'customname',
      token: 'abcdefg',
      url: 'https://codecov.io',
      flags: '',
      slug: '',
      upstream: '',
      feature: 'search'
    })
    expect(log).toHaveBeenCalledWith(
      expect.stringMatching(/Processing.*test\/fixtures\/\.coverage\.\.\./),
    )
  })

  it('will not process blocked files if not passed via -f', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {
      // intentionally empty
    })
    await app.main({
      dryRun: 'true',
      file: [
      ],
      name: 'customname',
      token: 'abcdefg',
      url: 'https://codecov.io',
      flags: '',
      slug: '',
      upstream: ''
    })
    expect(log).not.toHaveBeenCalledWith(
      expect.stringMatching(/Processing.*test\/fixtures\/other\/\.coverage\.\.\./),
    )
  })

  it('Can handle glob files', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {
      // intentionally empty
    })
    await app.main({
      dryRun: 'true',
      file: [
        'cover*.txt',
        '!fixtures/other'
      ],
      name: 'customname',
      token: 'abcdefg',
      url: 'https://codecov.io',
      flags: '',
      slug: '',
      upstream: ''
    })
    expect(log).toHaveBeenCalledWith(
      expect.stringMatching(/Processing.*test\/fixtures\/coverage\.txt\.\.\./),
    )
    expect(log).not.toHaveBeenCalledWith(
      expect.stringMatching(/Processing.*test\/fixtures\/other\/coverage\.txt\.\.\./),
    )
    expect(log).not.toHaveBeenCalledWith(
      expect.stringMatching(/Processing.*test\/does\/not\/exist\.txt\.\.\./),
    )
  })

  it('Can find only coverage from custom dir', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {
      // intentionally empty
    })
    await app.main({
      name: 'customname',
      token: 'abcdefg',
      url: 'https://codecov.io',
      dryRun: 'true',
      dir: './test/fixtures/other',
      flags: '',
      slug: '',
      upstream: ''
    })
    expect(log).toHaveBeenCalledWith(
      expect.stringMatching(/An example coverage other file/),
    )
    expect(log).not.toHaveBeenCalledWith(
      expect.stringMatching(/An example coverage root file/),
    )
  })

  it('Can remove coverage files', async () => {
    const unlink = jest.spyOn(fs, 'unlink').mockImplementation(() => {
      // intentionally empty
    })
    await app.main({
      name: 'customname',
      token: 'abcdefg',
      url: 'https://codecov.io',
      dryRun: 'true',
      dir: './test/fixtures/other',
      clean: 'true',
      flags: '',
      slug: '',
      upstream: ''
    })
    expect(unlink).toHaveBeenCalledWith(
      'test/fixtures/other/coverage.txt',
      expect.any(Function),
    )
  })

  it('Can include the network', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {
      // intentionally empty
    })
    await app.main({
      name: 'customname',
      token: 'abcdefg',
      url: 'https://codecov.io',
      dryRun: 'true',
      dir: './test/fixtures/other',
      flags: '',
      slug: '',
      upstream: ''
    })
    expect(log).toHaveBeenCalledWith(expect.stringMatching(/<<<<<< network/))
  })

  it('Can ignore the network', async () => {
    await app.main({
      name: 'customname',
      token: 'abcdefg',
      url: 'https://codecov.io',
      dryRun: 'true',
      feature: 'network',
      flags: '',
      slug: '',
      upstream: ''
    })
    expect(console.log).not.toHaveBeenCalledWith(
      expect.stringMatching(/<<<<<< network/),
    )
  })
})
