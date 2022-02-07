import td from 'testdouble'
import * as providerBuildkite from '../../src/ci_providers/provider_buildkite'
import { IServiceParams, UploaderInputs } from '../../src/types'
import { createEmptyArgs } from '../test_helpers'

describe('Buildkite Params', () => {
  afterEach(() => {
    td.reset()
  })

  describe('detect()', () => {
    it('does not run without Buildkite env variable', () => {
      const inputs: UploaderInputs = {
        args: { ...createEmptyArgs() },
        environment: {},
      }
      const detected = providerBuildkite.detect(inputs.environment)
      expect(detected).toBeFalsy()
    })

    it('does not run without Buildkite env variable', () => {
      const inputs: UploaderInputs = {
        args: { ...createEmptyArgs() },
        environment: {
          BUILDKITE: 'true',
        },
      }
      const detected = providerBuildkite.detect(inputs.environment)
      expect(detected).toBeTruthy()
    })
  })

  it('gets correct params on push', () => {
    const inputs: UploaderInputs = {
      args: { ...createEmptyArgs() },
      environment: {
        BUILDKITE: 'true',
        BUILDKITE_BUILD_NUMBER: '1',
        BUILDKITE_JOB_ID: '3',
        BUILDKITE_ORGANIZATION_SLUG: 'testOrg',
        BUILDKITE_PIPELINE_SLUG: 'testRepo',
        BUILDKITE_BRANCH: 'main',
        BUILDKITE_COMMIT: 'testingsha',
        BUILDKITE_BUILD_URL: 'https://buildkite.com/testOrg/testRepo',
        CI: 'true',
      },
    }
    const expected: IServiceParams = {
      branch: 'main',
      build: '1',
      buildURL: 'https://buildkite.com/testOrg/testRepo',
      commit: 'testingsha',
      job: '3',
      pr: '',
      service: 'buildkite',
      slug: 'testOrg/testRepo',
    }
    const params = providerBuildkite.getServiceParams(inputs)
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
        BUILDKITE: 'true',
        CI: 'true',
      },
    }
    const expected: IServiceParams = {
      branch: 'branch',
      build: '3',
      buildURL: '',
      commit: 'testsha',
      job: '',
      pr: '2',
      service: 'buildkite',
      slug: 'testOrg/testRepo',
    }

    const params = providerBuildkite.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })
})
