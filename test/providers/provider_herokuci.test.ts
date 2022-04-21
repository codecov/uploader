import td from 'testdouble'
import childProcess from 'child_process'
import { SPAWNPROCESSBUFFERSIZE } from '../../src/helpers/util'
import { IServiceParams, UploaderInputs } from '../../src/types'
import { createEmptyArgs } from '../test_helpers'

const providerHerokuci = require('../../src/ci_providers//provider_herokuci')

describe('HerokuCI Params', () => {
  afterEach(() => {
    td.reset()
  })

  describe('detect()', () => {
    it('does not run without HerokuCI env variable', () => {
      const inputs: UploaderInputs = {
        args: { ...createEmptyArgs() },
        environment: {},
      }
      const detected = providerHerokuci.detect(inputs.environment)
      expect(detected).toBeFalsy()
    })

    it('does run with Herokuci env variable', () => {
      const inputs: UploaderInputs = {
        args: { ...createEmptyArgs() },
        environment: {
          CI: 'true',
          HEROKU_TEST_RUN_BRANCH: 'test',
        },
      }
      const detected = providerHerokuci.detect(inputs.environment)
      expect(detected).toBeTruthy()
    })
  })

  // This should test that the provider outputs proper default values
  it('gets the correct params on no env variables', () => {
    const inputs: UploaderInputs = {
      args: { ...createEmptyArgs() },
      environment: {},
    }
    const expected: IServiceParams = {
      branch: '',
      build: '',
      buildURL: '',
      commit: '',
      job: '',
      pr: '',
      service: 'heroku',
      slug: '',
    }
    const spawnSync = td.replace(childProcess, 'spawnSync')
    td.when(
      spawnSync('git', ['config', '--get', 'remote.origin.url'], { maxBuffer: SPAWNPROCESSBUFFERSIZE }),
    ).thenReturn({ stdout: '' })
    const params = providerHerokuci.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  // This should test that the provider outputs proper parameters when a push event is created
  it('gets the correct params on push', () => {
    const inputs: UploaderInputs = {
      args: { tag: '', url: '', source: '', flags: '', slug: '', upstream: '' },
      environment: {
        CI: 'true',
        HEROKU_TEST_RUN_BRANCH: 'testBranch',
        HEROKU_TEST_RUN_COMMIT_VERSION: 'testSha',
        HEROKU_TEST_RUN_ID: '2',
      },
    }
    const expected: IServiceParams = {
      branch: 'testBranch',
      build: '2',
      buildURL: '',
      commit: 'testSha',
      job: '',
      pr: '',
      service: 'heroku',
      slug: 'testOrg/testRepo',
    }
    const spawnSync = td.replace(childProcess, 'spawnSync')
    td.when(
      spawnSync('git', ['config', '--get', 'remote.origin.url'], { maxBuffer: SPAWNPROCESSBUFFERSIZE }),
    ).thenReturn({ stdout: 'https://github.com/testOrg/testRepo.git' })
    const params = providerHerokuci.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  // This should test that the provider outputs proper parameters when given overrides
  it('gets the correct params on overrides', () => {
    const inputs: UploaderInputs = {
      args: {
        ...createEmptyArgs(),
        ...{
          branch: 'branch',
          build: '3',
          pr: '2',
          sha: 'testsha',
          slug: 'testOrg/testRepo',
        },
      },
      environment: {},
    }
    const expected: IServiceParams = {
      branch: 'branch',
      build: '3',
      buildURL: '',
      commit: 'testsha',
      job: '',
      pr: '2',
      service: 'heroku',
      slug: 'testOrg/testRepo',
    }
    const params = providerHerokuci.getServiceParams(inputs)
    expect(expected).toBeTruthy()
    expect(params).toMatchObject(expected)
  })
})
