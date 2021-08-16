import childProcess from 'child_process'
import td from 'testdouble'
import { detectProvider, walkProviders } from '../../src/helpers/provider'
import { IServiceParams, UploaderInputs } from '../../src/types'

describe('detectProvider()', () => {
  afterEach(() => {
    td.reset()
    jest.clearAllMocks()
  })

  it('can detect a manual override', () => {
    const inputs: UploaderInputs = {
      args: {
        sha: '1234566',
        slug: 'fakeOrg/fakeRepo',
      },
      environment: {},
    }
    const expectedOutput: IServiceParams = {
      branch: '',
      build: '',
      buildURL: '',
      commit: '1234566',
      job: '',
      pr: 0,
      service: '',
      slug: 'fakeOrg/fakeRepo',
    }
    expect(detectProvider(inputs)).toEqual(expectedOutput)
  })

  it('will throw if unable to detect', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    const spawnSync = td.replace(childProcess, 'spawnSync')
    td.when(spawnSync('git')).thenReturn({
      error: 'Git is not installed!',
    })
    const inputs: UploaderInputs = {
      args: {},
      environment: {},
    }
    expect(()  => detectProvider(inputs)).toThrowError(/Unable to detect service, please specify sha and slug manually/)
  })
})

describe('walkProviders()', () => {
  afterEach(() => {
    td.reset()
  })

  it('will throw if unable to detect', () => {
    const spawnSync = td.replace(childProcess, 'spawnSync')
    td.when(spawnSync('git')).thenReturn({
      error: 'Git is not installed!',
    })
    const inputs: UploaderInputs = {
      args: {},
      environment: {},
    }
    expect(()  => walkProviders(inputs)).toThrowError(/Unable to detect provider./)

  })

  it('will return serviceParams if able to detect', () => {
    const inputs: UploaderInputs = {
      args: {},
      environment: {
        CI: 'true',
        CIRCLECI: 'true',
      },
    }
    const expectedOutput: IServiceParams = {
      branch: '',
      build: '',
      buildURL: '',
      commit: '',
      job: '',
      pr: 0,
      service: 'circleci',
      slug: 'undefined/undefined',
    }
    expect(walkProviders(inputs)).toEqual(expectedOutput)
  })
})

