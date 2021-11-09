import td from 'testdouble'

import * as providerWercker from '../../src/ci_providers/provider_wercker'
import { IServiceParams, UploaderInputs } from '../../src/types'
import { createEmptyArgs } from '../test_helpers'

describe('Wercker CI Params', () => {
  afterEach(() => {
    td.reset()
  })

  describe('detect()', () => {
    it('does not run without Wercker CI env variable', () => {
      const inputs: UploaderInputs = {
        args: { ...createEmptyArgs() },
        environment: {},
      }
      const detected = providerWercker.detect(inputs.environment)
      expect(detected).toBeFalsy()
    })

    it('does run with Wercker CI env variable', () => {
      const inputs: UploaderInputs = {
        args: { ...createEmptyArgs() },
        environment: {
          CI: 'true',
          WERCKER_MAIN_PIPELINE_STARTED: 'true',
        },
      }
      const detected = providerWercker.detect(inputs.environment)
      expect(detected).toBeTruthy()
    })
  })

  it('gets correct params on push', () => {
    const inputs: UploaderInputs = {
      args: { ...createEmptyArgs() },
      environment: {
        CI: 'true',
        WERCKER_MAIN_PIPELINE_STARTED: '1',
        WERCKER_GIT_BRANCH: 'main',
        WERCKER_GIT_COMMIT: 'testingsha',
        WERCKER_GIT_OWNER: 'testOrg',
        WERCKER_GIT_REPOSITORY: 'testRepo',
        WERCKER_BUILD_URL: 'https://example.com/build',
      },
    }
    const expected: IServiceParams = {
      branch: 'main',
      build: '1',
      buildURL: 'https://example.com/build',
      commit: 'testingsha',
      job: '',
      pr: '',
      service: 'wercker',
      slug: 'testOrg/testRepo',
    }
    const params = providerWercker.getServiceParams(inputs)
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
        WERCKER_MAIN_PIPELINE_STARTED: '1',
        WERCKER_GIT_BRANCH: 'main',
        WERCKER_GIT_COMMIT: 'testingsha',
        WERCKER_GIT_OWNER: 'someone',
        WERCKER_GIT_REPOSITORY: 'somewhere',
        WERCKER_BUILD_URL: 'https://example.com/build',
      },
    }
    const expected: IServiceParams = {
      branch: 'branch',
      build: '3',
      buildURL: 'https://example.com/build',
      commit: 'testsha',
      job: '',
      pr: '2',
      service: 'wercker',
      slug: 'testOrg/testRepo',
    }

    const params = providerWercker.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })
})
