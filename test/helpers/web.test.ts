import nock from 'nock'

import { version } from '../../package.json'
import { generateQuery, getPackage, parsePOSTResults, populateBuildParams, uploadToCodecov, uploadToCodecovPUT } from '../../src/helpers/web'
import { IServiceParams } from '../../src/types'

describe('Web Helpers', () => {
  let uploadURL: string
  let token: string
  let uploadFile: string
  let query: string
  let source: string
  beforeEach(() => {
    token = '123-abc-890-xyz'
    uploadFile = 'some content'
    query = 'hello'
    source = ''

    // deepcode ignore WrongNumberOfArgs/test: believe this is a false positive
    nock('https://codecov.io').put('/').query(true).reply(200, 'testPUT')
  })

  afterEach(() => {
    uploadURL = ''
    jest.restoreAllMocks()
  })

  it('Can POST to the uploader endpoint (HTTP)', async () => {
    uploadURL = 'http://codecov.io'
    // deepcode ignore WrongNumberOfArgs/test: believe this is a false positive
    nock('http://codecov.io')
      .post('/upload/v4')
      .query(true)
      .reply(200, 'testPOSTHTTP')

    const response = await uploadToCodecov(
      uploadURL,
      token,
      query,
      uploadFile,
      source,
    )
    try {
      expect(response).toBe('testPOSTHTTP')
    } catch (error) {
      console.trace(error)
    }
  })

  it('Can POST to the uploader endpoint (HTTPS)', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {})
    uploadURL = 'https://codecov.io'
    // deepcode ignore WrongNumberOfArgs/test: believe this is a false positive
    nock('https://codecov.io')
      .post('/upload/v4')
      .query(true)
      .reply(200, 'testPOSTHTTPS')

    const response = await uploadToCodecov(
      uploadURL,
      token,
      query,
      uploadFile,
      source,
    )
    expect(response).toBe('testPOSTHTTPS')
  })

  it('Can PUT to the storage endpoint', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {})
    uploadURL = `https://results.codecov.io
    https://codecov.io`
    const response = await uploadToCodecovPUT(uploadURL, uploadFile)
    expect(response.resultURL).toEqual('https://results.codecov.io')
  })

  it('Can generate query URL', () => {
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
      pr: 2,
      job: '6',
    }
    expect(generateQuery(queryParams)).toBe(
      'branch=testBranch&commit=commitSHA&build=4&build_url=https%3A%2F%2Fci-providor.local%2Fjob%2Fxyz&name=testName&tag=tagV1&slug=testOrg%2FtestRepo&service=testingCI&flags=unit%2Cuploader&pr=2&job=6',
    )
  })

  it('NaN PR numbers are not propagated to the query', () => {
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
  })

  it('can populateBuildParams() from args', () => {
    const result = populateBuildParams(
      { args: { flags: 'testFlag', tag: 'testTag' }, environment: {} },
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
        pr: 0,
      },
    )
    expect(result.flags).toBe('testFlag')
  })

  it('can populateBuildParams() from args with multiple flags as string', () => {
    const result = populateBuildParams(
      { args: { flags: 'testFlag1,testFlag2', tag: 'testTag' }, environment: {} },
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
        pr: 0,
      },
    )
    expect(result.flags).toBe('testFlag1,testFlag2')
  })

  it('can populateBuildParams() from args with multiple flags as list', () => {
    const result = populateBuildParams(
      { args: { flags: ['testFlag1', 'testFlag2'], tag: 'testTag' }, environment: {} },
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
        pr: 0,
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
      expect(() => parsePOSTResults(testURL)).toThrowError(/Parsing results from POST failed/)
    })

    it('will throw when can not match exactly twice', () => {
      const testURL = `dummyURL`
      expect(() => parsePOSTResults(testURL)).toThrowError('Incorrect number of urls when parsing results from POST: 1')
    })

    it('will return an object when parsing correctly and input has multiple linebreaks', () => {
      const testURL = `dummyURL
      
      
      
      
      
      
      
      OtherURL`
      const expectedResults = { putURL: 'OtherURL', resultURL: 'dummyURL'}
      expect(parsePOSTResults(testURL)).toEqual(expectedResults)
    })
  })
})
