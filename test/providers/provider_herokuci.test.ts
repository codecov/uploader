import td from 'testdouble'
import childProcess from 'child_process'
import { SPAWNPROCESSBUFFERSIZE } from '../../src/helpers/constants'
import { IServiceParams, UploaderInputs } from '../../src/types'
import { createEmptyArgs } from '../test_helpers'

import * as providerHerokuci from '../../src/ci_providers/provider_herokuci'

describe('HerokuCI Params', () => {
  afterEach(() => {
    td.reset()
  })

  describe('detect()', () => {
    it('does not run without HerokuCI env variable', () => {
      const inputs: UploaderInputs = {
        args: { ...createEmptyArgs() },
        envs: {},
      }
      const detected = providerHerokuci.detect(inputs.envs)
      expect(detected).toBeFalsy()
    })

    it('does run with Herokuci env variable', () => {
      const inputs: UploaderInputs = {
        args: { ...createEmptyArgs() },
        envs: {
          CI: 'true',
          HEROKU_TEST_RUN_BRANCH: 'test',
        },
      }
      const detected = providerHerokuci.detect(inputs.envs)
      expect(detected).toBeTruthy()
    })
  })

  // This should test that the provider outputs proper default values
  it('gets the correct params on no env variables', async () => {
    const inputs: UploaderInputs = {
      args: { ...createEmptyArgs() },
      envs: {},
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
    ).thenReturn({ stdout: Buffer.from('') })
    const params = await providerHerokuci.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  // This should test that the provider outputs proper parameters when a push event is created
  it('gets the correct params on push', async () => {
    const inputs: UploaderInputs = {
      args: { tag: '', url: '', source: '', flags: '', slug: '', upstream: '' },
      envs: {
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
    ).thenReturn({ stdout: Buffer.from('https://github.com/testOrg/testRepo.git') })
    const params = await providerHerokuci.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  // This should test that the provider outputs proper parameters when given overrides
  it('gets the correct params on overrides', async () => {
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
      envs: {},
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
    const params = await providerHerokuci.getServiceParams(inputs)
    expect(expected).toBeTruthy()
    expect(params).toMatchObject(expected)
  })
})
