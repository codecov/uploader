import td from 'testdouble'
import * as providerBuildkite from '../../src/ci_providers/provider_buildkite'
import { IServiceParams, UploaderInputs } from '../../src/types'

describe('Buildkite Params', () => {
  afterEach(() => {
    td.reset()
  })

  describe('detect()', () => {
    it('does not run without Buildkite env variable', () => {
      const inputs = {
        args: {},
        envs: {},
      }
      const detected = providerBuildkite.detect(inputs.envs)
      expect(detected).toBeFalsy()
    })

    it('does not run without Buildkite env variable', () => {
      const inputs = {
        args: {},
        envs: {
          BUILDKITE: 'true',
        },
      }
      const detected = providerBuildkite.detect(inputs.envs)
      expect(detected).toBeTruthy()
    })
  })

  it('gets correct params on push', () => {
    const inputs: UploaderInputs = {
      args: {
        tag: '',
        url: '',
        source: '',
        flags: '',
      },
      envs: {
        BUILDKITE: 'true',
        BUILDKITE_BUILD_NUMBER: '1',
        BUILDKITE_JOB_ID: '3',
        BUILDKITE_PROJECT_SLUG: 'testRepo',
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
      pr: 0,
      service: 'buildkite',
      slug: 'testRepo',
    }
    const params = providerBuildkite.getServiceParams(inputs)
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
      envs: {
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
      pr: 2,
      service: 'buildkite',
      slug: 'testOrg/testRepo',
    }

    const params = providerBuildkite.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })
})
