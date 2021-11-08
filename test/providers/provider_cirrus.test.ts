import td from 'testdouble'

import * as providerCirrus from '../../src/ci_providers/provider_cirrus'
import { IServiceParams, UploaderInputs } from '../../src/types'

describe('Cirrus Params', () => {
  afterEach(() => {
    td.reset()
  })

  describe('detect()', () => {
    it('does not run without Cirrus env variable', () => {
      const inputs: UploaderInputs = {
        args: {
          flags: '',
          slug: '',
          upstream: ''
        },
        environment: {},
      }
      const detected = providerCirrus.detect(inputs.environment)
      expect(detected).toBeFalsy()
    })

    it('does run with Cirrus env variable', () => {
      const inputs = {
        args: {},
        environment: {
          CI: 'true',
          CIRRUS_CI: 'true',
        },
      }
      const detected = providerCirrus.detect(inputs.environment)
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
        slug: '',
        upstream: ''
      },
      environment: {
        CI: 'true',
        CIRRUS_CI: 'true',
        CIRRUS_BRANCH: 'master',
        CIRRUS_CHANGE_IN_REPO: 'testingsha',
        CIRRUS_BUILD_ID: '2',
        CIRRUS_PR: '1',
        CIRRUS_REPO_OWNER: 'testOrg',
        CIRRUS_REPO_NAME: 'testRepo',
      },
    }
    const expected: IServiceParams = {
      branch: 'master',
      build: '2',
      buildURL: '',
      commit: 'testingsha',
      job: '',
      pr: '1',
      service: 'cirrus-ci',
      slug: 'testOrg/testRepo',
    }
    const params = providerCirrus.getServiceParams(inputs)
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
        upstream: ''
      },
      environment: {
        CI: 'true',
        CIRRUS_CI: 'true',
        CIRRUS_BRANCH: 'master',
        CIRRUS_CHANGE_IN_REPO: 'testingsha',
        CIRRUS_BUILD_ID: '2',
        CIRRUS_PR: '1',
        CIRRUS_REPO_OWNER: 'testOrg',
        CIRRUS_REPO_NAME: 'testRepo',
      },
    }
    const expected: IServiceParams = {
      branch: 'branch',
      build: '3',
      buildURL: '',
      commit: 'testsha',
      job: '',
      pr: '2',
      service: 'cirrus-ci',
      slug: 'testOrg/testRepo',
    }

    const params = providerCirrus.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })
})
