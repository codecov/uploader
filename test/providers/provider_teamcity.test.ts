import td from 'testdouble'
import childProcess from 'child_process'

import * as providerTeamCity from '../../src/ci_providers/provider_teamcity'
import { IServiceParams, UploaderInputs } from '../../src/types'

describe('TeamCity Params', () => {
  afterEach(() => {
    td.reset()
  })

  describe('detect()', () => {
    it('does not run without TeamCity env variable', () => {
      const inputs: UploaderInputs = {
        args: {},
        environment: {},
      }
      const detected = providerTeamCity.detect(inputs.environment)
      expect(detected).toBeFalsy()
    })

    it('does run with TeamCity env variable', () => {
      const inputs: UploaderInputs = {
        args: {
          tag: '',
          url: '',
          source: '',
        },
        environment: {
          CI: 'true',
          TEAMCITY_VERSION: 'true',
        },
      }
      const detected = providerTeamCity.detect(inputs.environment)
      expect(detected).toBeTruthy()
    })
  })

  it('gets correct params', () => {
    const inputs: UploaderInputs = {
      args: {
        tag: '',
        url: '',
        source: '',
        flags: '',
      },
      environment: {
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
      pr: 0,
      service: 'teamcity',
      slug: '',
    }
    const spawnSync = td.replace(childProcess, 'spawnSync')
    td.when(
      spawnSync('git', ['config', '--get', 'remote.origin.url']),
    ).thenReturn({ stdout: '' })
    const params = providerTeamCity.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  it('gets correct params and remote slug', () => {
    const inputs: UploaderInputs = {
      args: {
        tag: '',
        url: '',
        source: '',
        flags: '',
      },
      environment: {
        CI: 'true',
        TEAMCITY_VERSION: 'true',
        BRANCH_NAME: 'main',
        BUILD_VCS_NUMBER: 'testingsha',
        BUILD_NUMBER: '1',
      },
    }
    const expected : IServiceParams= {
      branch: 'main',
      build: '1',
      buildURL: '',
      commit: 'testingsha',
      job: '',
      pr: 0,
      service: 'teamcity',
      slug: 'testOrg/testRepo',
    }
    const spawnSync = td.replace(childProcess, 'spawnSync')
    td.when(
      spawnSync('git', ['config', '--get', 'remote.origin.url']),
    ).thenReturn({ stdout: 'https://github.com/testOrg/testRepo.git' })
    const params = providerTeamCity.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  it('gets correct params for overrides', () => {
    const inputs: UploaderInputs = {
      args: {
        branch: 'branch',
        build: '3',
        pr: '2',
        sha: 'testsha',
        slug: 'testOrg/testRepo',
        tag: '',
        url: '',
        source: '',
        flags: '',
      },
      environment: {
        CI: 'true',
        TEAMCITY_VERSION: 'true',
        BRANCH_NAME: 'main',
        BUILD_VCS_NUMBER: 'testingsha',
        BUILD_NUMBER: '1',
      },
    }
    const spawnSync = td.replace(childProcess, 'spawnSync')
    td.when(
      spawnSync('git', ['config', '--get', 'remote.origin.url']),
    ).thenReturn({ stdout: '' })
    const expected: IServiceParams = {
      branch: 'branch',
      build: '3',
      buildURL: '',
      commit: 'testsha',
      job: '',
      pr: 2,
      service: 'teamcity',
      slug: 'testOrg/testRepo',
    }

    const params = providerTeamCity.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })
})
