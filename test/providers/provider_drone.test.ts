import td from 'testdouble'

import * as providerDrone from '../../src/ci_providers/provider_drone'
import { IServiceParams, UploaderInputs } from '../../src/types'
import { createEmptyArgs } from '../test_helpers'

describe('Drone Params', () => {
  afterEach(() => {
    td.reset()
  })

  describe('detect()', () => {
    it('does not run without Drone env variable', () => {
      const inputs: UploaderInputs = {
        args: { ...createEmptyArgs() },
        envs: {},
      }
      const detected = providerDrone.detect(inputs.envs)
      expect(detected).toBeFalsy()
    })

    it('does run with Drone env variable', () => {
      const inputs: UploaderInputs = {
        args: { ...createEmptyArgs() },
        envs: {
          CI: 'true',
          DRONE: 'true',
        },
      }
      const detected = providerDrone.detect(inputs.envs)
      expect(detected).toBeTruthy()
    })
  })

  it('gets correct params', async () => {
    const inputs: UploaderInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        CI: 'true',
        DRONE: 'true',
        DRONE_BRANCH: 'master',
        DRONE_COMMIT_SHA: 'testingsha',
        DRONE_BUILD_NUMBER: '2',
        DRONE_PULL_REQUEST: '1',
        DRONE_BUILD_LINK: 'https://www.drone.io/',
        DRONE_REPO: 'testOrg/testRepo',
      },
    }
    const expected: IServiceParams = {
      branch: 'master',
      build: '2',
      buildURL: 'https://www.drone.io/',
      commit: 'testingsha',
      job: '',
      pr: '1',
      service: 'drone.io',
      slug: 'testOrg/testRepo',
    }
    const params = await providerDrone.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  it('gets correct params for DRONE_BUILD_URL', async () => {
    const inputs: UploaderInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        CI: 'true',
        DRONE: 'true',
        DRONE_BRANCH: 'master',
        DRONE_COMMIT_SHA: 'testingsha',
        DRONE_BUILD_NUMBER: '2',
        DRONE_PULL_REQUEST: '1',
        DRONE_BUILD_URL: 'https://www.drone.io/',
        DRONE_REPO: 'testOrg/testRepo',
      },
    }
    const expected: IServiceParams = {
      branch: 'master',
      build: '2',
      buildURL: 'https://www.drone.io/',
      commit: 'testingsha',
      job: '',
      pr: '1',
      service: 'drone.io',
      slug: 'testOrg/testRepo',
    }
    const params = await providerDrone.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })
})
