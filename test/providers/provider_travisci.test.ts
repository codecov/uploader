import td from 'testdouble'

import * as providerTravisci from '../../src/ci_providers/provider_travisci'
import { IServiceParams, UploaderInputs } from '../../src/types'
import { createEmptyArgs } from '../test_helpers'

describe('TravisCI Params', () => {
  afterEach(() => {
    td.reset()
  })

  describe('detect()', () => {
    it('does not run with Shipable env variable', () => {
      const inputs: UploaderInputs = {
        args: { ...createEmptyArgs() },
        environment: {},
      }
      let detected = providerTravisci.detect(inputs.environment)
      expect(detected).toBeFalsy()

      inputs.environment.CI = 'true'
      detected = providerTravisci.detect(inputs.environment)
      expect(detected).toBeFalsy()

      inputs.environment.TRAVIS = 'true'
      detected = providerTravisci.detect(inputs.environment)
      expect(detected).toBeTruthy()

      inputs.environment.SHIPPABLE = 'true'
      detected = providerTravisci.detect(inputs.environment)
      expect(detected).toBeFalsy()
    })

    it('does run with TravisCI env variable', () => {
      const inputs: UploaderInputs = {
        args: { ...createEmptyArgs() },
        environment: {
          CI: 'true',
          TRAVIS: 'true',
        },
      }
      const detected = providerTravisci.detect(inputs.environment)
      expect(detected).toBeTruthy()
    })
  })

  it('gets correct params on push', () => {
    const inputs: UploaderInputs = {
      args: { ...createEmptyArgs() },
      environment: {
        CI: 'true',
        TRAVIS: 'true',
        TRAVIS_JOB_NUMBER: '1',
        TRAVIS_BRANCH: 'main',
        TRAVIS_TAG: 'main',
        TRAVIS_JOB_ID: '2',
        TRAVIS_PULL_REQUEST: '',
        TRAVIS_COMMIT: 'testingsha',
        TRAVIS_REPO_SLUG: 'testOrg/testRepo',
      },
    }
    const expected: IServiceParams = {
      branch: '',
      build: '1',
      buildURL: '',
      commit: 'testingsha',
      job: '2',
      pr: '',
      service: 'travis',
      slug: 'testOrg/testRepo',
    }
    const params = providerTravisci.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  it('gets correct params on PR', () => {
    const inputs: UploaderInputs = {
      args: { ...createEmptyArgs() },
      environment: {
        CI: 'true',
        TRAVIS: 'true',
        TRAVIS_BRANCH: 'branch',
        TRAVIS_COMMIT: 'testingsha',
        TRAVIS_JOB_ID: '2',
        TRAVIS_JOB_NUMBER: '1',
        TRAVIS_PULL_REQUEST: '',
        TRAVIS_PULL_REQUEST_BRANCH: 'branch',
        TRAVIS_PULL_REQUEST_SHA: 'testingprsha',
        TRAVIS_REPO_SLUG: 'testOrg/testRepo',
        TRAVIS_TAG: 'main',
      },
    }
    const expected: IServiceParams = {
      branch: 'branch',
      build: '1',
      buildURL: '',
      commit: 'testingprsha',
      job: '2',
      pr: '',
      service: 'travis',
      slug: 'testOrg/testRepo',
    }
    const params = providerTravisci.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  it('gets correct params on PR with no pull request branch', () => {
    const inputs: UploaderInputs = {
      args: { ...createEmptyArgs() },
      environment: {
        CI: 'true',
        TRAVIS: 'true',
        TRAVIS_BRANCH: 'branch',
        TRAVIS_COMMIT: 'testingsha',
        TRAVIS_JOB_ID: '2',
        TRAVIS_JOB_NUMBER: '1',
        TRAVIS_PULL_REQUEST: '',
        TRAVIS_PULL_REQUEST_SHA: 'testingprsha',
        TRAVIS_REPO_SLUG: 'testOrg/testRepo',
        TRAVIS_TAG: 'main',
      },
    }
    const expected: IServiceParams = {
      branch: 'branch',
      build: '1',
      buildURL: '',
      commit: 'testingprsha',
      job: '2',
      pr: '',
      service: 'travis',
      slug: 'testOrg/testRepo',
    }
    const params = providerTravisci.getServiceParams(inputs)
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
          slug: 'testOrg/testRepo',
        },
      },
      environment: {
        CI: 'true',
        TRAVIS: 'true',
      },
    }
    const expected: IServiceParams = {
      branch: 'branch',
      build: '3',
      buildURL: '',
      commit: 'testsha',
      job: '',
      pr: '2',
      service: 'travis',
      slug: 'testOrg/testRepo',
    }

    const params = providerTravisci.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })
})
