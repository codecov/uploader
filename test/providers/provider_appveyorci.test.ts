import td from 'testdouble'

import * as providerAppveyorci from '../../src/ci_providers//provider_appveyorci'
import { IServiceParams, UploaderInputs } from '../../src/types'
import { createEmptyArgs } from '../test_helpers'

describe('AppveyorCI Params', () => {
  afterEach(() => {
    td.reset()
  })

  describe('detect()', () => {
    it('does not run without AppveyorCI env variable', () => {
      const inputs: UploaderInputs = {
        args: { ...createEmptyArgs() },
        environment: {},
      }
      let detected = providerAppveyorci.detect(inputs.environment)
      expect(detected).toBeFalsy()

      inputs.environment.CI = 'true'
      detected = providerAppveyorci.detect(inputs.environment)
      expect(detected).toBeFalsy()

      inputs.environment.CI = 'True'
      detected = providerAppveyorci.detect(inputs.environment)
      expect(detected).toBeFalsy()

      inputs.environment.CI = 'false'
      inputs.environment.APPVEYOR = 'true'
      detected = providerAppveyorci.detect(inputs.environment)
      expect(detected).toBeFalsy()

      inputs.environment.APPVEYOR = 'True'
      detected = providerAppveyorci.detect(inputs.environment)
      expect(detected).toBeFalsy()
    })

    it('does run with AppveyorCI env variable', () => {
      const inputs: UploaderInputs = {
        args: { ...createEmptyArgs() },
        environment: {
          CI: 'true',
          APPVEYOR: 'true',
        },
      }
      const detected = providerAppveyorci.detect(inputs.environment)
      expect(detected).toBeTruthy()
    })
  })

  it('gets correct params on push', () => {
    const inputs: UploaderInputs = {
      args: { ...createEmptyArgs() },
      environment: {
        APPVEYOR: 'true',
        APPVEYOR_ACCOUNT_NAME: 'testOrg',
        APPVEYOR_BUILD_ID: '2',
        APPVEYOR_BUILD_VERSION: '3',
        APPVEYOR_JOB_ID: '1',
        APPVEYOR_PROJECT_SLUG: 'testRepo',
        APPVEYOR_REPO_BRANCH: 'main',
        APPVEYOR_REPO_COMMIT: 'testingsha',
        APPVEYOR_REPO_NAME: 'testOrg/testRepo',
        APPVEYOR_URL: 'https://appveyor.com',
        CI: 'true',
      },
    }
    const expected: IServiceParams = {
      branch: 'main',
      build: '1',
      buildURL: 'https://appveyor.com/project/testOrg/testRepo/builds/2/job/1',
      commit: 'testingsha',
      job: 'testOrg/testRepo/3',
      pr: '',
      service: 'appveyor',
      slug: 'testOrg/testRepo',
    }
    const params = providerAppveyorci.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  it('gets correct params for PRs', () => {
    const inputs: UploaderInputs = {
      args: { ...createEmptyArgs() },
      environment: {
        APPVEYOR: 'true',
        APPVEYOR_ACCOUNT_NAME: 'testOrg',
        APPVEYOR_BUILD_ID: '2',
        APPVEYOR_BUILD_VERSION: '3',
        APPVEYOR_JOB_ID: '1',
        APPVEYOR_PROJECT_SLUG: 'testRepo',
        APPVEYOR_PULL_REQUEST_NUMBER: '4',
        APPVEYOR_REPO_BRANCH: 'main',
        APPVEYOR_REPO_COMMIT: 'testingshamerge',
        APPVEYOR_PULL_REQUEST_HEAD_COMMIT : 'testingsha',
        APPVEYOR_REPO_NAME: 'testOrg/testRepo',
        APPVEYOR_URL: 'https://appveyor.com',
        CI: 'true',
      },
    }
    const expected: IServiceParams = {
      branch: 'main',
      build: '1',
      buildURL: 'https://appveyor.com/project/testOrg/testRepo/builds/2/job/1',
      commit: 'testingsha',
      job: 'testOrg/testRepo/3',
      pr: '4',
      service: 'appveyor',
      slug: 'testOrg/testRepo',
    }
    const params = providerAppveyorci.getServiceParams(inputs)
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
        APPVEYOR: 'true',
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
      service: 'appveyor',
      slug: 'testOrg/testRepo',
    }

    const params = providerAppveyorci.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })
})
