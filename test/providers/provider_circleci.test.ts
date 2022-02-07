import td from 'testdouble'

import * as providerCircleci from '../../src/ci_providers//provider_circleci'
import { IServiceParams, UploaderInputs } from '../../src/types'
import { createEmptyArgs } from '../test_helpers'

describe('CircleCI Params', () => {
  afterEach(() => {
    td.reset()
  })

  describe('detect()', () => {
    it('does not run without CircleCI env variable', () => {
      const inputs: UploaderInputs = {
        args: {...createEmptyArgs(), },
        environment: {},
      }
      const detected = providerCircleci.detect(inputs.environment)
      expect(detected).toBeFalsy()
    })

    it('does run with CircleCI env variable', () => {
      const inputs: UploaderInputs = {
        args: {...createEmptyArgs(), },
        environment: {
          CI: 'true',
          CIRCLECI: 'true',
        },
      }
      const detected = providerCircleci.detect(inputs.environment)
      expect(detected).toBeTruthy()
    })
  })

  it('gets correct params', () => {
    const inputs: UploaderInputs = {
      args: {...createEmptyArgs(), },
      environment: {
        CI: 'true',
        CIRCLECI: 'true',
        CIRCLE_BRANCH: 'master',
        CIRCLE_SHA1: 'testingsha',
        CIRCLE_PROJECT_REPONAME: 'testRepo',
        CIRCLE_PROJECT_USERNAME: 'testOrg',
        CIRCLE_REPOSITORY_URL: 'git@github.com:testOrg/testRepo.git',
        CIRCLE_BUILD_NUM: '2',
        CIRCLE_PR_NUMBER: '1',
        CIRCLE_NODE_INDEX: '3',
      },
    }
    const expected: IServiceParams = {
      branch: 'master',
      build: '2',
      buildURL: '',
      commit: 'testingsha',
      job: '3',
      pr: '1',
      service: 'circleci',
      slug: 'testOrg/testRepo',
    }
    const params = providerCircleci.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  it('gets correct slug when empty reponame', () => {
    const inputs: UploaderInputs = {
      args: {...createEmptyArgs(), },
      environment: {
        CI: 'true',
        CIRCLECI: 'true',
        CIRCLE_BRANCH: 'master',
        CIRCLE_SHA1: 'testingsha',
        CIRCLE_PROJECT_REPONAME: '',
        CIRCLE_REPOSITORY_URL: 'git@github.com:testOrg/testRepo.git',
        CIRCLE_BUILD_NUM: '2',
        CIRCLE_PR_NUMBER: '1',
        CIRCLE_NODE_INDEX: '3',
      },
    }
    const expected: IServiceParams = {
      branch: 'master',
      build: '2',
      buildURL: '',
      commit: 'testingsha',
      job: '3',
      pr: '1',
      service: 'circleci',
      slug: 'testOrg/testRepo',
    }
    const params = providerCircleci.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })
})
