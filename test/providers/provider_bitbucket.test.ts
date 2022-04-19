import childProcess from 'child_process'
import td from 'testdouble'
import * as providerBitbucket from '../../src/ci_providers//provider_bitbucket'
import { SPAWNPROCESSBUFFERSIZE } from '../../src/helpers/util'
import { IServiceParams, UploaderInputs } from '../../src/types'
import { createEmptyArgs } from '../test_helpers'

describe('Bitbucket Params', () => {
  afterEach(() => {
    td.reset()
  })

  describe('detect()', () => {
    it('does not run without Bitbucket env variable', () => {
      const inputs: UploaderInputs = {
        args: {...createEmptyArgs(), },
        environment: {},
      }
      let detected = providerBitbucket.detect(inputs.environment)
      expect(detected).toBeFalsy()

      inputs.environment['CI'] = 'true'
      detected = providerBitbucket.detect(inputs.environment)
      expect(detected).toBeFalsy()
    })

    it('does not run without Bitbucket env variable', () => {
      const inputs: UploaderInputs = {
        args: {...createEmptyArgs(), },
        environment: {
          BITBUCKET_BUILD_NUMBER: '1',
          CI: 'true',
        },
      }
      const detected = providerBitbucket.detect(inputs.environment)
      expect(detected).toBeTruthy()
    })
  })

  it('gets the correct params on no env variables', () => {
    const inputs: UploaderInputs = {
      args: {...createEmptyArgs(), },
      environment: {
        BITBUCKET_BUILD_NUMBER: '1',
        CI: 'true',
      },
    }
    const expected: IServiceParams = {
      branch: '',
      build: '1',
      buildURL: '',
      commit: '',
      job: '1',
      pr: '',
      service: 'bitbucket',
      slug: '',
    }
    const params = providerBitbucket.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  it('gets the correct params on pr', () => {
    const inputs: UploaderInputs = {
      args: {...createEmptyArgs(), },
      environment: {
        BITBUCKET_BRANCH: 'main',
        BITBUCKET_BUILD_NUMBER: '1',
        BITBUCKET_COMMIT: 'testingsha',
        BITBUCKET_PR_ID: '2',
        BITBUCKET_REPO_FULL_NAME: 'testOwner/testSlug',
        CI: 'true',
      },
    }
    const expected: IServiceParams = {
      branch: 'main',
      build: '1',
      buildURL: '',
      commit: 'testingsha',
      job: '1',
      pr: '2',
      service: 'bitbucket',
      slug: 'testOwner/testSlug',
    }
    const params = providerBitbucket.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  it('gets the correct params on push', () => {
    const inputs: UploaderInputs = {
      args: {...createEmptyArgs(), },
      environment: {
        BITBUCKET_BRANCH: 'main',
        BITBUCKET_BUILD_NUMBER: '1',
        BITBUCKET_COMMIT: 'testingsha',
        BITBUCKET_REPO_FULL_NAME: 'testOwner/testSlug',
        CI: 'true',
      },
    }
    const expected: IServiceParams = {
      branch: 'main',
      build: '1',
      buildURL: '',
      commit: 'testingsha',
      job: '1',
      pr: '',
      service: 'bitbucket',
      slug: 'testOwner/testSlug',
    }
    const params = providerBitbucket.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  it('gets the correct params with short SHA', () => {
    const inputs: UploaderInputs = {
      args: {...createEmptyArgs(), },
      environment: {
        BITBUCKET_BRANCH: 'main',
        BITBUCKET_BUILD_NUMBER: '1',
        BITBUCKET_COMMIT: 'testingsha12',
        BITBUCKET_REPO_FULL_NAME: 'testOwner/testSlug',
        CI: 'true',
      },
    }
    const expected: IServiceParams = {
      branch: 'main',
      build: '1',
      buildURL: '',
      commit: 'newtestsha',
      job: '1',
      pr: '',
      service: 'bitbucket',
      slug: 'testOwner/testSlug',
    }

    const execFileSync = td.replace(childProcess, 'spawnSync')
    td.when(execFileSync('git', ['rev-parse', 'testingsha12'], { maxBuffer: SPAWNPROCESSBUFFERSIZE })).thenReturn(
      { stdout: 'newtestsha'},
    )
    const params = providerBitbucket.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  it('gets the correct params on overrides', () => {
    const inputs: UploaderInputs = {
      args: {...createEmptyArgs(), ...{
        branch: 'feature',
        build: '3',
        pr: '4',
        sha: 'overwriteSha',
        slug: 'overwriteOwner/overwriteRepo',

      }},
      environment: {
        BITBUCKET_BRANCH: 'main',
        BITBUCKET_BUILD_NUMBER: '1',
        BITBUCKET_COMMIT: 'testingsha',
        BITBUCKET_PR_ID: '2',
        BITBUCKET_REPO_FULL_NAME: 'testOwner/testSlug',
        CI: 'true',
      },
    }
    const expected: IServiceParams = {
      branch: 'feature',
      build: '3',
      buildURL: '',
      commit: 'overwriteSha',
      job: '1',
      pr: '4',
      service: 'bitbucket',
      slug: 'overwriteOwner/overwriteRepo',
    }
    const params = providerBitbucket.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })
})
