import td from 'testdouble'
import childProcess from 'child_process'
import { SPAWNPROCESSBUFFERSIZE } from '../../src/helpers/util'
import { IServiceParams, UploaderInputs } from '../../src/types'
import { createEmptyArgs } from '../test_helpers'

import * as providerBitrise from '../../src/ci_providers//provider_bitrise'

describe('Bitrise Params', () => {
  afterEach(() => {
    td.reset()
  })

  describe('detect()', () => {
    it('does not run without Bitrise env variable', () => {
      const inputs: UploaderInputs = {
        args: { ...createEmptyArgs() },
        environment: {},
      }
      const detected = providerBitrise.detect(inputs.environment)
      expect(detected).toBeFalsy()
    })

    it('does not run with only CI env variable', () => {
      const inputs: UploaderInputs= {
        args: { ...createEmptyArgs() },
        environment: {
          CI: 'true',
        },
      }
      const detected = providerBitrise.detect(inputs.environment)
      expect(detected).toBeFalsy()
    })

    it('runs with Bitrise env variables', () => {
      const inputs: UploaderInputs= {
        args: { ...createEmptyArgs() },
        environment: {
          BITRISE_IO: 'true',
          CI: 'true',
        },
      }
      const detected = providerBitrise.detect(inputs.environment)
      expect(detected).toBeTruthy()
    })
  })

  // This should test that the provider outputs proper default values
  it('gets the correct params on no env variables', () => {
    const inputs: UploaderInputs = {
      args: { ...createEmptyArgs() },
      environment: {
        BITRISE_IO: 'true',
        CI: 'true',
      },
    }
    const expected: IServiceParams = {
      branch: '',
      build: '',
      buildURL: '',
      commit: '',
      job: '',
      pr: '',
      service: 'bitrise',
      slug: '',
    }
    const spawnSync = td.replace(childProcess, 'spawnSync')
    td.when(
      spawnSync('git', ['config', '--get', 'remote.origin.url'], { maxBuffer: SPAWNPROCESSBUFFERSIZE }),
    ).thenReturn({ stdout: '' })

    const params = providerBitrise.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  // This should test that the provider outputs proper parameters when a push event is created
  it('gets the correct params on push', () => {
    const inputs: UploaderInputs = {
      args: { ...createEmptyArgs() },
      environment: {
        BITRISE_BUILD_NUMBER: '2',
        BITRISE_BUILD_URL: 'https://bitrise.com/testOrg/testRepo/2',
        BITRISE_GIT_BRANCH: 'main',
        BITRISE_IO: 'true',
        CI: 'true',
        GIT_CLONE_COMMIT_HASH: 'testingSha',
      },
    }
    const expected: IServiceParams = {
      branch: 'main',
      build: '2',
      buildURL: 'https://bitrise.com/testOrg/testRepo/2',
      commit: 'testingSha',
      job: '',
      pr: '',
      service: 'bitrise',
      slug: 'testOrg/testRepo',
    }
    const spawnSync = td.replace(childProcess, 'spawnSync')
    td.when(
      spawnSync('git', ['config', '--get', 'remote.origin.url'], { maxBuffer: SPAWNPROCESSBUFFERSIZE }),
    ).thenReturn({ stdout: 'https://github.com/testOrg/testRepo.git' })
    const params = providerBitrise.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  it('gets the correct params on pr', () => {
    const inputs: UploaderInputs = {
      args: { ...createEmptyArgs() },
      environment: {
        BITRISE_BUILD_NUMBER: '2',
        BITRISE_BUILD_URL: 'https://bitrise.com/testOrg/testRepo/2',
        BITRISE_GIT_BRANCH: 'main',
        BITRISE_IO: 'true',
        BITRISE_PULL_REQUEST: '3',
        CI: 'true',
        GIT_CLONE_COMMIT_HASH: 'testingSha',
      },
    }
    const expected: IServiceParams = {
      branch: 'main',
      build: '2',
      buildURL: 'https://bitrise.com/testOrg/testRepo/2',
      commit: 'testingSha',
      job: '',
      pr: '3',
      service: 'bitrise',
      slug: 'testOrg/testRepo',
    }
    const spawnSync = td.replace(childProcess, 'spawnSync')
    td.when(
      spawnSync('git', ['config', '--get', 'remote.origin.url'], { maxBuffer: SPAWNPROCESSBUFFERSIZE }),
    ).thenReturn({ stdout: 'https://github.com/testOrg/testRepo.git' })
    const params = providerBitrise.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  // This should test that the provider outputs proper parameters when given overrides
  it('gets the correct params on overrides', () => {
    const inputs: UploaderInputs = {
      args: {
        ...createEmptyArgs(),
        ...{
          branch: 'test',
          build: '10',
          pr: '11',
          sha: 'otherTestingSha',
          slug: 'neworg/newRepo',
        },
      },
      environment: {
        BITRISE_BUILD_NUMBER: '2',
        BITRISE_BUILD_URL: 'https://bitrise.com/testOrg/testRepo/2',
        BITRISE_GIT_BRANCH: 'main',
        BITRISE_IO: 'true',
        BITRISE_PULL_REQUEST: '3',
        CI: 'true',
        GIT_CLONE_COMMIT_HASH: 'testingSha',
      },
    }
    const expected: IServiceParams = {
      branch: 'test',
      build: '10',
      buildURL: 'https://bitrise.com/testOrg/testRepo/2',
      commit: 'otherTestingSha',
      job: '',
      pr: '11',
      service: 'bitrise',
      slug: 'neworg/newRepo',
    }
    const spawnSync = td.replace(childProcess, 'spawnSync')
    td.when(
      spawnSync('git', ['config', '--get', 'remote.origin.url'], { maxBuffer: SPAWNPROCESSBUFFERSIZE }),
    ).thenReturn({ stdout: 'https://github.com/testOrg/testRepo.git' })
    const params = providerBitrise.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })
})
