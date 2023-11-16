import td from 'testdouble'
import childProcess from 'child_process'

import * as providerTeamCity from '../../src/ci_providers/provider_teamcity'
import { SPAWNPROCESSBUFFERSIZE } from '../../src/helpers/constants'
import { IServiceParams, UploaderInputs } from '../../src/types'
import { createEmptyArgs } from '../test_helpers'

describe('TeamCity Params', () => {
  afterEach(() => {
    td.reset()
  })

  describe('detect()', () => {
    it('does not run without TeamCity env variable', () => {
      const inputs: UploaderInputs = {
        args: { ...createEmptyArgs() },
        envs: {},
      }
      const detected = providerTeamCity.detect(inputs.envs)
      expect(detected).toBeFalsy()
    })

    it('does run with TeamCity env variable', () => {
      const inputs: UploaderInputs = {
        args: { ...createEmptyArgs() },
        envs: {
          CI: 'true',
          TEAMCITY_VERSION: 'true',
        },
      }
      const detected = providerTeamCity.detect(inputs.envs)
      expect(detected).toBeTruthy()
    })
  })

  it('gets correct params', async () => {
    const inputs: UploaderInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        CI: 'true',
        TEAMCITY_VERSION: 'true',
        BRANCH_NAME: 'main',
        BUILD_VCS_NUMBER: 'testingsha',
        BUILD_NUMBER: '1',
      },
    }
    const expected: IServiceParams = {
      branch: 'main',
      build: '1',
      buildURL: '',
      commit: 'testingsha',
      job: '',
      pr: '',
      service: 'teamcity',
      slug: '',
    }
    const spawnSync = td.replace(childProcess, 'spawnSync')
    td.when(
      spawnSync('git', ['config', '--get', 'remote.origin.url'], { maxBuffer: SPAWNPROCESSBUFFERSIZE }),
    ).thenReturn({ stdout: Buffer.from('') })
    const params = await providerTeamCity.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  it('gets correct params and remote slug', async () => {
    const inputs: UploaderInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        CI: 'true',
        TEAMCITY_VERSION: 'true',
        BRANCH_NAME: 'main',
        BUILD_VCS_NUMBER: 'testingsha',
        BUILD_NUMBER: '1',
      },
    }
    const expected: IServiceParams = {
      branch: 'main',
      build: '1',
      buildURL: '',
      commit: 'testingsha',
      job: '',
      pr: '',
      service: 'teamcity',
      slug: 'testOrg/testRepo',
    }
    const spawnSync = td.replace(childProcess, 'spawnSync')
    td.when(
      spawnSync('git', ['config', '--get', 'remote.origin.url'], { maxBuffer: SPAWNPROCESSBUFFERSIZE }),
    ).thenReturn({ stdout: Buffer.from('https://github.com/testOrg/testRepo.git') })
    const params = await providerTeamCity.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  it('gets correct params for overrides', async () => {
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
      envs: {
        CI: 'true',
        TEAMCITY_VERSION: 'true',
        BRANCH_NAME: 'main',
        BUILD_VCS_NUMBER: 'testingsha',
        BUILD_NUMBER: '1',
      },
    }
    const spawnSync = td.replace(childProcess, 'spawnSync')
    td.when(
      spawnSync('git', ['config', '--get', 'remote.origin.url'], { maxBuffer: SPAWNPROCESSBUFFERSIZE }),
    ).thenReturn({ stdout: Buffer.from('') })
    const expected: IServiceParams = {
      branch: 'branch',
      build: '3',
      buildURL: '',
      commit: 'testsha',
      job: '',
      pr: '2',
      service: 'teamcity',
      slug: 'testOrg/testRepo',
    }

    const params = await providerTeamCity.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })
})
