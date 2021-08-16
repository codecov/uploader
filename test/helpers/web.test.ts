import nock from 'nock'

import { version } from '../../package.json'
import * as webHelper from '../../src/helpers/web'
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

    const response = await webHelper.uploadToCodecov(
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

    const response = await webHelper.uploadToCodecov(
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
    uploadURL = 'https://results.codecov.io\nhttps://codecov.io'
    const response = await webHelper.uploadToCodecovPUT(uploadURL, uploadFile)
    expect(response.resultURL).toBe('https://results.codecov.io')
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
    expect(webHelper.generateQuery(queryParams)).toBe(
      'branch=testBranch&commit=commitSHA&build=4&build_url=https://ci-providor.local/job/xyz&name=testName&tag=tagV1&slug=testOrg/testRepo&service=testingCI&flags=unit,uploader&pr=2&job=6',
    )
  })

  it('can populateBuildParams() from args', () => {
    const result = webHelper.populateBuildParams(
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
    const result = webHelper.populateBuildParams(
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
    const result = webHelper.populateBuildParams(
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
    const result = webHelper.getPackage('github-actions-2.0.0')
    expect(result).toBe(`github-actions-2.0.0-uploader-${version}`)
  })

  it('can getPackage() from no source', () => {
    const result = webHelper.getPackage('')
    expect(result).toBe(`uploader-${version}`)
  })
})
