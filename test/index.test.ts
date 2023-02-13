import Module from 'module'

import fs from 'fs'
import td from 'testdouble'
import {
  MockAgent,
  MockClient,
  setGlobalDispatcher,
} from 'undici'

import * as app from '../src'

import { version } from '../package.json'
import { UploadLogger } from '../src/helpers/logger'
import * as providerHelpers from '../src/helpers/provider'
import * as webHelpers from '../src/helpers/web'
import { IServiceParams } from '../src/types'

// Backup the env
const realEnv = { ...process.env }

describe('Uploader Core', () => {
  const env = process.env

  UploadLogger.setLogLevel('verbose')

  let mockAgent: MockAgent
  let mockClient: MockClient

  beforeEach(() => {
    // https://bensmithgall.com/blog/jest-mock-trick if this works!
    const mockExit = jest.fn()
    function mockProcess() {
      const original = Module.createRequire('process')
      return { ...original, exit: mockExit }
    }

    jest.mock('process', () => mockProcess())
    jest.resetAllMocks()

    mockAgent = new MockAgent({ connections: 1 })
    setGlobalDispatcher(mockAgent)
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

    const args = {
      flags: '',
      name: 'customname',
      slug: '',
      token: 'abcdefg',
      upstream: '',
      url: 'https://codecov.io',
    }
    const inputs = { args, environment: process.env }
    const serviceParams = providerHelpers.detectProvider(inputs, args.token != '')
    const buildParams = webHelpers.populateBuildParams(inputs, serviceParams)
    const query = webHelpers.generateQuery(buildParams)

    mockClient = mockAgent.get('https://codecov.io')
    mockClient.intercept({
      method: 'POST',
      path: `/upload/v4?package=uploader-${version}&token=${args.token}&${query}`,
    }).reply(200, 'https://results.codecov.io\nhttps://codecov.io')

    mockClient.intercept({
      method: 'PUT',
      path: '/',
    }).reply(200, 'success')

    const result = await app.main(args)
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

    it('Can upload without token if slug is passed', async () => {
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
        slug: 'codecov/uploader',
        upstream: ''
      })
      expect(log).toHaveBeenCalledWith(
        expect.stringMatching('-> No token specified or token is empty'),
      )
    })

    it('Cannot upload without token if slug is not passed', async () => {
      const f = () => app.main({
        name: 'customname',
        url: 'https://codecov.io',
        dryRun: 'true',
        env: 'SOMETHING,ANOTHER',
        flags: '',
        slug: '',
        upstream: ''
      })

      const detectProvider = td.replace(providerHelpers, 'detectProvider')
      const buildParams: Partial<IServiceParams> = {
        branch: '',
        build: '',
        buildURL: '',
        commit: 'testSHA',
        job: '',
        pr: '',
        service: 'no service',
        slug: '',
      }
      td.when(detectProvider(td.matchers.anything(), false)).thenReturn(buildParams)

      await expect(f()).rejects.toThrow(
        'Slug must be set if a token is not passed',
      )
    })
  })

  describe('Flags', () => {
    it('can upload with flags', async () => {
      process.env.CI = 'true'
      process.env.CIRCLECI = 'true'

      const args = {
        flags: 'a-flag',
        token: 'abcdefg',
        url: 'https://codecov.io',
        tag: '',
        source: '',
        slug: '',
        upstream: ''
      }
      const inputs = { args, environment: process.env }
      const serviceParams = providerHelpers.detectProvider(inputs, args.token != '')
      const buildParams = webHelpers.populateBuildParams(inputs, serviceParams)
      const query = webHelpers.generateQuery(buildParams)

      mockClient = mockAgent.get('https://codecov.io')
      mockClient.intercept({
        method: 'POST',
        path: `/upload/v4?package=uploader-${version}&token=${args.token}&${query}`,
      }).reply(200, 'https://results.codecov.io\nhttps://codecov.io')

      mockClient.intercept({
        method: 'PUT',
        path: '/',
      }).reply(200, 'success')

      const result = await app.main(args)
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
    const args = {
      token: 'abcdefg',
      url: 'https://codecov.io',
      parent,
      flags: '',
      slug: '',
      upstream: ''
    }
    const inputs = { args, environment: process.env }
    const serviceParams = providerHelpers.detectProvider(inputs, args.token != '')
    const buildParams = webHelpers.populateBuildParams(inputs, serviceParams)
    const query = webHelpers.generateQuery(buildParams)

    mockClient = mockAgent.get('https://codecov.io')
    mockClient.intercept({
      method: 'POST',
      path: `/upload/v4?package=uploader-${version}&token=${args.token}&${query}`,
    }).reply(200, 'https://results.codecov.io\nhttps://codecov.io')

    mockClient.intercept({
      method: 'PUT',
      path: '/',
    }).reply(200, 'success')

    const result = await app.main(args)
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

  it('Can find multiple specified files as comma-separated', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {
      // intentionally empty
    })
    await app.main({
      dryRun: 'true',
      file: 'test/fixtures/coverage.txt,test/fixtures/other/coverage.txt,test/does/not/exist.txt',
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

  it('Can create fixes', async () => {
    await app.main({
      name: 'customname',
      token: 'abcdefg',
      url: 'https://codecov.io',
      dryRun: 'true',
      feature: 'fixes',
      flags: '',
      slug: '',
      upstream: ''
    })
    expect(console.log).toHaveBeenCalledWith(
      expect.stringMatching(/# path=fixes\ntest\/fixtures\/fixes\/example.go:2,4,5,7,8,9,10,11,13,14,15,16,17,19,20,21,23,24,25,27,28,29,32,34\ntest\/fixtures\/fixes\/example.php:4,6,11,15,19,20\ntest\/fixtures\/gcov\/main.c:2,4,11,12,13,14,16,20\n<<<<<< EOF/)
    )
  })
})
