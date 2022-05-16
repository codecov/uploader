import {
  MockAgent,
  MockClient,
  ProxyAgent,
  setGlobalDispatcher,
} from 'undici'

import { version } from '../../package.json'
import {
  displayChangelog,
  generateQuery,
  generateRequestHeadersPOST,
  generateRequestHeadersPUT,
  getPackage,
  parsePOSTResults,
  populateBuildParams,
  uploadToCodecovPOST,
  uploadToCodecovPUT,
} from '../../src/helpers/web'
import { IServiceParams, PostResults, UploaderArgs } from '../../src/types'
import { createEmptyArgs } from '../test_helpers'

describe('Web Helpers', () => {
  let uploadURL: string
  let token: string
  let uploadFile: string
  let query: string
  let source: string

  let mockAgent: MockAgent
  let mockClient: MockClient
  beforeEach(() => {
    token = '123-abc-890-xyz'
    uploadFile = 'some content'
    query = 'hello'
    source = ''

    // deepcode ignore WrongNumberOfArgs/test: believe this is a false positive
    mockAgent = new MockAgent({ connections: 1 })
    setGlobalDispatcher(mockAgent)
  })

  afterEach(() => {
    uploadURL = ''
    jest.restoreAllMocks()
  })

  it('Can POST to the uploader endpoint (HTTP)', async () => {
    uploadURL = 'http://codecov.io'
    mockClient = mockAgent.get(uploadURL)
    mockClient.intercept({
      method: 'POST',
      path: `/upload/v4?package=uploader-${version}&token=${token}&hello`,
    }).reply(200, 'testPOSTHTTP')

    const response = await uploadToCodecovPOST(
      new URL(uploadURL),
      token,
      query,
      source,
      {
        flags: '',
        slug: '',
        upstream: '',
      },
    )
    try {
      expect(response).toBe('testPOSTHTTP')
    } catch (error) {
      throw new Error(`${response} - ${error}`)
      console.trace(error)
    }
  })

  it('Can POST to the uploader endpoint (HTTPS)', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => void {})
    uploadURL = 'https://codecov.io'
    mockClient = mockAgent.get(uploadURL)
    mockClient.intercept({
      method: 'POST',
      path: `/upload/v4?package=uploader-${version}&token=${token}&hello`,
    }).reply(200, 'testPOSTHTTPS')

    const response = await uploadToCodecovPOST(
      new URL(uploadURL),
      token,
      query,
      source,
      {
        flags: '',
        slug: '',
        upstream: '',
      },
    )
    expect(response).toBe('testPOSTHTTPS')
  })

  it('Can PUT to the storage endpoint', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => void {})
    const postResults: PostResults = {
      putURL: new URL('https://codecov.io'),
      resultURL: new URL('https://results.codecov.io'),
    }

    mockClient = mockAgent.get(postResults.putURL.origin)
    mockClient.intercept({
      method: 'PUT',
      path: '/',
    }).reply(200, postResults.resultURL.href)

    const response = await uploadToCodecovPUT(postResults, uploadFile, {
      flags: '',
      slug: '',
      upstream: '',
    })
    expect(response.resultURL.href).toStrictEqual('https://results.codecov.io/')
  })

  it('Can generate query URL', () => {
    const queryParams: IServiceParams = {
      branch: 'testBranch',
      commit: 'commitSHA',
      build: '4',
      buildURL: 'https://ci-providor.local/job/xyz',
      name: 'testName',
      tag: 'tagV1',
      slug: 'testOrg/testRepo',
      service: 'testingCI',
      flags: 'unit,uploader',
      pr: '2',
      job: '6',
    }
    expect(generateQuery(queryParams)).toBe(
      'branch=testBranch&commit=commitSHA&build=4&build_url=https%3A%2F%2Fci-providor.local%2Fjob%2Fxyz&name=testName&tag=tagV1&slug=testOrg%2FtestRepo&service=testingCI&flags=unit%2Cuploader&pr=2&job=6',
    )
  })

  /* it('NaN PR numbers are not propagated to the query', () => {
    const queryParams: IServiceParams  = {
      branch: 'testBranch',
      commit: 'commitSHA',
      build: '4',
      buildURL: 'https://ci-providor.local/job/xyz',
      name: 'testName',
      tag: 'tagV1',
      slug: 'testOrg/testRepo',
      service: 'testingCI',
      flags: 'unit,uploader',
      pr: NaN,
      job: '6',
    }
    expect(generateQuery(queryParams)).toBe(
      'branch=testBranch&commit=commitSHA&build=4&build_url=https%3A%2F%2Fci-providor.local%2Fjob%2Fxyz&name=testName&tag=tagV1&slug=testOrg%2FtestRepo&service=testingCI&flags=unit%2Cuploader&pr=&job=6',
    )
  }) */

  it('can populateBuildParams() from args', () => {
    const result = populateBuildParams(
      {
        args: {
          ...createEmptyArgs(),
          ...{ flags: 'testFlag', tag: 'testTag' },
        },
        environment: {},
      },
      {
        name: '',
        tag: ',',
        flags: '',
        branch: '',
        build: '',
        buildURL: '',
        commit: '',
        job: '',
        service: 'Testing',
        slug: '',
        pr: '0',
      },
    )
    expect(result.flags).toBe('testFlag')
  })

  it('can populateBuildParams() from args with multiple flags as string', () => {
    const result = populateBuildParams(
      {
        args: {
          ...createEmptyArgs(),
          ...{
            flags: 'testFlag1,testFlag2',
            tag: 'testTag',
          },
        },
        environment: {},
      },
      {
        name: '',
        tag: '',
        flags: '',
        branch: '',
        build: '',
        buildURL: '',
        commit: '',
        job: '',
        service: 'Testing',
        slug: '',
        pr: '0',
      },
    )
    expect(result.flags).toBe('testFlag1,testFlag2')
  })

  it('can populateBuildParams() from args with multiple flags as list', () => {
    const result = populateBuildParams(
      {
        args: {
          ...createEmptyArgs(),
          ...{
            flags: ['testFlag1', 'testFlag2'],
            tag: 'testTag',
          },
        },
        environment: {},
      },
      {
        name: '',
        tag: '',
        flags: '',
        branch: '',
        build: '',
        buildURL: '',
        commit: '',
        job: '',
        service: 'Testing',
        slug: '',
        pr: '0',
      },
    )
    expect(result.flags).toBe('testFlag1,testFlag2')
  })

  it('can getPackage() from source', () => {
    const result = getPackage('github-actions-2.0.0')
    expect(result).toBe(`github-actions-2.0.0-uploader-${version}`)
  })

  it('can getPackage() from no source', () => {
    const result = getPackage('')
    expect(result).toBe(`uploader-${version}`)
  })

  describe('parsePOSTResults()', () => {
    it('will throw when unable to match', () => {
      const testURL = `🤨`
      expect(() => parsePOSTResults(testURL)).toThrowError(
        /Parsing results from POST failed/,
      )
    })

    it('will throw when can not match exactly twice', () => {
      const testURL = `dummyURL`
      expect(() => parsePOSTResults(testURL)).toThrowError(
        'Incorrect number of urls when parsing results from POST: 1',
      )
    })

    it('will return an object when parsing correctly and input has multiple linebreaks', () => {
      const testURL = `https://result.codecov.local







      https://put.codecov.local`
      const expectedResults = {
        putURL: 'https://put.codecov.local/',
        resultURL: 'https://result.codecov.local/',
      }
      expect(JSON.stringify(parsePOSTResults(testURL))).toStrictEqual(JSON.stringify(expectedResults))
    })
  })
})

describe('displayChangelog()', () => {
  it('displays the correct link containing the current version', () => {
    const fn = jest.spyOn(console, 'log').mockImplementation(() => void {})
    displayChangelog()
    expect(fn).toBeCalledWith(expect.stringContaining(version))
  })
})

describe('generateRequestHeadersPOST()', () => {
  const args: UploaderArgs = { ...createEmptyArgs() }

  it('should return return the correct url when args.upstream is not set', () => {
    args.upstream = ''
    const requestHeaders = generateRequestHeadersPOST(
      new URL('https://localhost.local'),
      '134',
      'slug=testOrg/testUploader',
      'G',
      args,
    )

    expect(requestHeaders.url.href).toEqual(
      `https://localhost.local/upload/v4?package=${getPackage(
        'G',
      )}&token=134&slug=testOrg/testUploader`,
    )
    expect(typeof requestHeaders.options.body).toEqual('undefined')
    expect(typeof requestHeaders.agent).toEqual('undefined')
  })

  it('should return return the correct url when args.upstream is set', () => {
    args.upstream = 'http://proxy.local'
    const requestHeaders = generateRequestHeadersPOST(
      new URL('https:localhost.local'),
      '134',
      'slug=testOrg/testUploader',
      'G',
      args,
    )

    expect(requestHeaders.url.href).toEqual(
      `https://localhost.local/upload/v4?package=${getPackage(
        'G',
      )}&token=134&slug=testOrg/testUploader`,
    )

    expect(typeof requestHeaders.options.body).toEqual('undefined')
    expect(requestHeaders.agent).toMatchObject(
      new ProxyAgent(args.upstream),
    )
  })
})

describe('generateRequestHeadersPUT()', () => {
  const args: UploaderArgs = { ...createEmptyArgs() }

  it('should return return the correct url when args.upstream is not set', () => {
    args.upstream = ''
    const requestHeaders = generateRequestHeadersPUT(
      new URL('https://localhost.local'),
      "I'm a coverage report!",
      args,
    )

    expect(requestHeaders.url.href).toEqual('https://localhost.local/')
    expect(requestHeaders.options.body).toEqual("I'm a coverage report!")
    expect(typeof requestHeaders.agent).toEqual('undefined')
  })

  it('should return return the correct url when args.upstream is set', () => {
    args.upstream = 'http://proxy.local'
    const requestHeaders = generateRequestHeadersPUT(
      new URL('https://localhost.local'),
      "I'm a coverage report!",
      args,
    )

    expect(requestHeaders.url.href).toEqual('https://localhost.local/')
    expect(requestHeaders.options.body).toEqual("I'm a coverage report!")
    expect(requestHeaders.agent).toMatchObject(
      new ProxyAgent(args.upstream),
    )
  })
})
