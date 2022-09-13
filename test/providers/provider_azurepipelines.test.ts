import td from 'testdouble'
import childProcess from 'child_process'

import * as providerAzurepipelines from '../../src/ci_providers//provider_azurepipelines'
import { SPAWNPROCESSBUFFERSIZE } from '../../src/helpers/util'
import { IServiceParams, UploaderInputs } from '../../src/types'
import { createEmptyArgs } from '../test_helpers'

describe('Azure Pipelines CI Params', () => {
  afterEach(() => {
    td.reset()
  })

  describe('detect()', () => {
    it('does not run without AzurePipelines env variable', () => {
      const inputs: UploaderInputs = {
        args: { ...createEmptyArgs() },
        environment: {},
      }
      const detected = providerAzurepipelines.detect(inputs.environment)
      expect(detected).toBeFalsy()
    })

    it('does run with AzurePipelines env variable', () => {
      const inputs: UploaderInputs = {
        args: { ...createEmptyArgs() },
        environment: {
          SYSTEM_TEAMFOUNDATIONSERVERURI: 'true',
        },
      }
      const detected = providerAzurepipelines.detect(inputs.environment)
      expect(detected).toBeTruthy()
    })
  })

  it('gets empty string if environment variable is undefined', () => {
    const inputs: UploaderInputs = {
      args: { ...createEmptyArgs() },
      environment: {
        SYSTEM_TEAMFOUNDATIONSERVERURI: 'https://example.azure.com',
      },
    }
    const expected: IServiceParams = {
      branch: '',
      build: '',
      buildURL: '',
      commit: '',
      job: '',
      pr: '',
      project: '',
      server_uri: 'https://example.azure.com',
      service: 'azure_pipelines',
      slug: '',
    }
    const spawnSync = td.replace(childProcess, 'spawnSync')
    td.when(
      spawnSync('git', ['config', '--get', 'remote.origin.url'], { maxBuffer: SPAWNPROCESSBUFFERSIZE }),
    ).thenReturn({ stdout: '' })

    const params = providerAzurepipelines.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  it('gets correct params on pr number', () => {
    const inputs: UploaderInputs = {
      args: { ...createEmptyArgs() },
      environment: {
        BUILD_BUILDNUMBER: '1',
        BUILD_BUILDID: '2',
        BUILD_REPOSITORY_NAME: 'testOrg/testRepo',
        BUILD_SOURCEBRANCH: 'refs/heads/main',
        BUILD_SOURCEVERSION: 'testingsha',
        SYSTEM_BUILD_BUILDID: '1',
        SYSTEM_PULLREQUEST_PULLREQUESTNUMBER: '3',
        SYSTEM_TEAMFOUNDATIONSERVERURI: 'https://example.azure.com',
        SYSTEM_TEAMPROJECT: 'testOrg',
      },
    }
    const expected: IServiceParams = {
      branch: 'main',
      build: '1',
      buildURL: 'https://example.azure.comtestOrg/_build/results?buildId=2',
      commit: 'testingsha',
      job: '2',
      pr: '3',
      project: 'testOrg',
      server_uri: 'https://example.azure.com',
      service: 'azure_pipelines',
      slug: 'testOrg/testRepo',
    }
    const execFileSync = td.replace(childProcess, 'execFileSync')
    td.when(
      execFileSync('git', ['show', '--no-patch', '--format=%P']),
    ).thenReturn(
      'nonmergesha23456789012345678901234567890',
    )
    const params = providerAzurepipelines.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  it('gets correct params on pr id', () => {
    const inputs: UploaderInputs = {
      args: { ...createEmptyArgs() },
      environment: {
        BUILD_BUILDNUMBER: '1',
        BUILD_BUILDID: '2',
        BUILD_REPOSITORY_NAME: 'testOrg/testRepo',
        BUILD_SOURCEBRANCH: 'refs/heads/main',
        BUILD_SOURCEVERSION: 'testingsha',
        SYSTEM_BUILD_BUILDID: '1',
        SYSTEM_PULLREQUEST_PULLREQUESTID: '3',
        SYSTEM_TEAMFOUNDATIONSERVERURI: 'https://example.azure.com',
        SYSTEM_TEAMPROJECT: 'testOrg',
      },
    }
    const expected: IServiceParams = {
      branch: 'main',
      build: '1',
      buildURL: 'https://example.azure.comtestOrg/_build/results?buildId=2',
      commit: 'testingsha',
      job: '2',
      pr: '3',
      project: 'testOrg',
      server_uri: 'https://example.azure.com',
      service: 'azure_pipelines',
      slug: 'testOrg/testRepo',
    }
    const execFileSync = td.replace(childProcess, 'execFileSync')
    td.when(
      execFileSync('git', ['show', '--no-patch', '--format=%P']),
    ).thenReturn(
      'nonmergesha23456789012345678901234567890',
    )
    const params = providerAzurepipelines.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  it('gets correct slug by remote address', () => {
    const inputs: UploaderInputs = {
      args: { ...createEmptyArgs() },
      environment: {
        BUILD_BUILDNUMBER: '1',
        BUILD_BUILDID: '2',
        BUILD_SOURCEBRANCH: 'refs/heads/main',
        BUILD_SOURCEVERSION: 'testingsha',
        SYSTEM_BUILD_BUILDID: '1',
        SYSTEM_TEAMFOUNDATIONSERVERURI: 'https://example.azure.com',
        SYSTEM_TEAMPROJECT: 'testOrg',
      },
    }
    const expected: IServiceParams = {
      branch: 'main',
      build: '1',
      buildURL: 'https://example.azure.comtestOrg/_build/results?buildId=2',
      commit: 'testingsha',
      job: '2',
      pr: '',
      project: 'testOrg',
      server_uri: 'https://example.azure.com',
      service: 'azure_pipelines',
      slug: 'testOrg/testRepo',
    }

    const spawnSync = td.replace(childProcess, 'spawnSync')
    td.when(
      spawnSync('git', ['config', '--get', 'remote.origin.url'], { maxBuffer: SPAWNPROCESSBUFFERSIZE }),
    ).thenReturn({ stdout: 'https://github.com/testOrg/testRepo.git' })
    const params = providerAzurepipelines.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  it('gets correct params on merge', () => {
    const inputs: UploaderInputs = {
      args: { ...createEmptyArgs() },
      environment: {
        BUILD_BUILDNUMBER: '1',
        BUILD_BUILDID: '2',
        BUILD_REPOSITORY_NAME: 'testOrg/testRepo',
        BUILD_SOURCEBRANCH: 'refs/heads/main',
        BUILD_SOURCEVERSION: 'testingsha',
        SYSTEM_BUILD_BUILDID: '1',
        SYSTEM_PULLREQUEST_PULLREQUESTID: '3',
        SYSTEM_TEAMFOUNDATIONSERVERURI: 'https://example.azure.com',
        SYSTEM_TEAMPROJECT: 'testOrg',
      },
    }
    const expected: IServiceParams = {
      branch: 'main',
      build: '1',
      buildURL: 'https://example.azure.comtestOrg/_build/results?buildId=2',
      commit: 'testingmergecommitsha2345678901234567890',
      job: '2',
      pr: '3',
      project: 'testOrg',
      server_uri: 'https://example.azure.com',
      service: 'azure_pipelines',
      slug: 'testOrg/testRepo',
    }
    const execFileSync = td.replace(childProcess, 'execFileSync')
    td.when(
      execFileSync('git', ['show', '--no-patch', '--format=%P']),
    ).thenReturn(
      'testingsha123456789012345678901234567890 testingmergecommitsha2345678901234567890',
    )
    const params = providerAzurepipelines.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  it('gets correct params for overrides', () => {
    const inputs: UploaderInputs = {
      args: {
        ...createEmptyArgs(),
        ...{
          branch: 'branch',
          build: '3',
          pr: '2',
          sha: 'testsha',
          slug: 'testOrg/otherTestRepo',
        },
      },
      environment: {
        SYSTEM_TEAMFOUNDATIONSERVERURI: 'https://example.azure.com',
        BUILD_REPOSITORY_NAME: 'testOrg/testRepo',
      },
    }
    const expected: IServiceParams = {
      branch: 'branch',
      build: '3',
      buildURL: '',
      commit: 'testsha',
      job: '',
      pr: '2',
      project: '',
      server_uri: 'https://example.azure.com',
      service: 'azure_pipelines',
      slug: 'testOrg/otherTestRepo',
    }

    const params = providerAzurepipelines.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })
})
