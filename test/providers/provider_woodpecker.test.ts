import td from 'testdouble'

import * as providerWoodpecker from '../../src/ci_providers/provider_woodpecker'
import { IServiceParams, UploaderInputs } from '../../src/types'
import { createEmptyArgs } from '../test_helpers'

describe('Woodpecker Params', () => {
  afterEach(() => {
    td.reset()
  })

  describe('detect()', () => {
    it('does not run without Woodpecker env variable', () => {
      const inputs: UploaderInputs = {
        args: { ...createEmptyArgs() },
        environment: {},
      }
      const detected = providerWoodpecker.detect(inputs.environment)
      expect(detected).toBeFalsy()
    })

    it('does run with Woodpecker env variable', () => {
      const inputs: UploaderInputs = {
        args: { ...createEmptyArgs() },
        environment: {
          CI: 'woodpecker',
        },
      }
      const detected = providerWoodpecker.detect(inputs.environment)
      expect(detected).toBeTruthy()
    })
  })

  it('gets correct params', () => {
    const inputs: UploaderInputs = {
      args: { ...createEmptyArgs() },
      environment: {
        CI: 'woodpecker',
        CI_COMMIT_BRANCH: 'master',
        CI_COMMIT_SHA: 'testingsha',
        CI_BUILD_NUMBER: '2',
        CI_BUILD_LINK: 'https://ci.woodpecker-ci.org/woodpecker-ci/woodpecker/build/1629',
        CI_JOB_NUMBER: '12',
        CI_REPO: 'testOrg/testRepo',
      },
    }
    const expected: IServiceParams = {
      branch: 'master',
      build: '2',
      buildURL: 'https://ci.woodpecker-ci.org/woodpecker-ci/woodpecker/build/1629',
      commit: 'testingsha',
      pr: '',
      job: '12',
      service: 'woodpecker',
      slug: 'testOrg/testRepo',
    }
    const params = providerWoodpecker.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })
  
  it('gets correct params for pull request', () => {
    const inputs: UploaderInputs = {
      args: { ...createEmptyArgs() },
      environment: {
        CI: 'woodpecker',
        CI_COMMIT_BRANCH: 'master',
        CI_COMMIT_SOURCE_BRANCH: 'new-feature',
        CI_COMMIT_SHA: 'testingsha',
        CI_BUILD_NUMBER: '2',
        CI_JOB_NUMBER: '20',
        CI_COMMIT_PULL_REQUEST: '1',
        CI_BUILD_LINK: 'https://ci.woodpecker-ci.org/woodpecker-ci/woodpecker/build/1629',
        CI_REPO: 'testOrg/testRepo',
      },
    }
    const expected: IServiceParams = {
      branch: 'new-feature',
      build: '2',
      buildURL: 'https://ci.woodpecker-ci.org/woodpecker-ci/woodpecker/build/1629',
      commit: 'testingsha',
      job: '20',
      pr: '1',
      service: 'woodpecker',
      slug: 'testOrg/testRepo',
    }
    const params = providerWoodpecker.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })
})
