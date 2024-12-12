import td from 'testdouble'
import * as providerSemaphore from '../../src/ci_providers/provider_semaphore'
import { IServiceParams, UploaderInputs } from '../../src/types'
import { createEmptyArgs } from '../test_helpers'

describe('Semaphore Params', () => {
  afterEach(() => {
    td.reset()
  })

  describe('detect()', () => {
    it('does not run without Semaphore env variable', () => {
      const inputs: UploaderInputs = {
        args: { ...createEmptyArgs() },
        envs: {},
      }
      let detected = providerSemaphore.detect(inputs.envs)
      expect(detected).toBeFalsy()

      inputs.envs['CI'] = 'true'
      detected = providerSemaphore.detect(inputs.envs)
      expect(detected).toBeFalsy()
    })

    it('does run with Semaphore env variable', () => {
      const inputs: UploaderInputs = {
        args: { ...createEmptyArgs() },
        envs: {
          CI: 'true',
          SEMAPHORE: 'true',
        },
      }
      const detected = providerSemaphore.detect(inputs.envs)
      expect(detected).toBeTruthy()
    })
  })

  // This should test that the provider outputs proper default values
  it('gets the correct params on no env variables', async () => {
    const inputs: UploaderInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        CI: 'true',
        SEMAPHORE: 'true',
      },
    }
    const expected: IServiceParams = {
      branch: '',
      build: '',
      buildURL: '',
      commit: '',
      job: '',
      pr: '',
      service: 'semaphore',
      slug: '',
    }
    const params = await providerSemaphore.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  // This should test that the provider outputs proper parameters when a push event is created
  it('gets the correct params on push', async () => {
    const inputs: UploaderInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        CI: 'true',
        SEMAPHORE: 'true',
        SEMAPHORE_GIT_BRANCH: 'master',
        SEMAPHORE_GIT_REPO_SLUG: 'org/user',
        SEMAPHORE_GIT_SHA: 'testingsha',
        SEMAPHORE_ORGANIZATION_URL: 'https://example.semaphoreci.com',
        SEMAPHORE_WORKFLOW_ID: '03d9de4c-c798-4df5-bbd5-786db9d4d309',
        SEMAPHORE_WORKFLOW_NUMBER: '1',
      },
    }
    const expected: IServiceParams = {
      branch: 'master',
      build: '1',
      buildURL: 'https://example.semaphoreci.com/workflows/03d9de4c-c798-4df5-bbd5-786db9d4d309',
      commit: 'testingsha',
      job: '03d9de4c-c798-4df5-bbd5-786db9d4d309',
      pr: '',
      service: 'semaphore',
      slug: 'org/user',
    }
    const params = await providerSemaphore.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })
  //
  // This should test that the provider outputs proper parameters when a pull request event is created
  it('gets the correct params on pr', async () => {
    const inputs: UploaderInputs = {
      args: { ...createEmptyArgs() },
      envs: {
        CI: 'true',
        SEMAPHORE: 'true',
        SEMAPHORE_GIT_BRANCH: 'master',
        SEMAPHORE_GIT_PR_BRANCH: 'feature-branch',
        SEMAPHORE_GIT_PR_NUMBER: '1234',
        SEMAPHORE_GIT_PR_SHA: 'prsha',
        SEMAPHORE_GIT_PR_SLUG: 'org/user',
        SEMAPHORE_GIT_SHA: 'testingsha',
        SEMAPHORE_ORGANIZATION_URL: 'https://example.semaphoreci.com',
        SEMAPHORE_WORKFLOW_ID: '03d9de4c-c798-4df5-bbd5-786db9d4d309',
        SEMAPHORE_WORKFLOW_NUMBER: '1',
      },
    }
    const expected: IServiceParams = {
      branch: 'feature-branch',
      build: '1',
      buildURL: 'https://example.semaphoreci.com/workflows/03d9de4c-c798-4df5-bbd5-786db9d4d309',
      commit: 'prsha',
      job: '03d9de4c-c798-4df5-bbd5-786db9d4d309',
      pr: '1234',
      service: 'semaphore',
      slug: 'org/user',
    }
    const params = await providerSemaphore.getServiceParams(inputs)
    expect(expected).toBeTruthy()
  })

  // This should test that the provider outputs proper parameters when given overrides
  it('gets the correct params on overrides', async () => {
    const inputs: UploaderInputs = {
      args: {...createEmptyArgs(), ...{
        branch: 'overwrite-feature-branch',
        build: '3',
        pr: '4',
        sha: 'overwriteSha',
        slug: 'overwriteOwner/overwriteRepo',
      }},
      envs: {
        CI: 'true',
        SEMAPHORE: 'true',
        SEMAPHORE_GIT_BRANCH: 'master',
        SEMAPHORE_GIT_PR_BRANCH: 'feature-branch',
        SEMAPHORE_GIT_PR_NUMBER: '1234',
        SEMAPHORE_GIT_PR_SHA: 'prsha',
        SEMAPHORE_GIT_PR_SLUG: 'org/user',
        SEMAPHORE_GIT_SHA: 'testingsha',
        SEMAPHORE_ORGANIZATION_URL: 'https://example.semaphoreci.com',
        SEMAPHORE_WORKFLOW_ID: '03d9de4c-c798-4df5-bbd5-786db9d4d309',
        SEMAPHORE_WORKFLOW_NUMBER: '1',
      },
    }
    const expected: IServiceParams = {
      branch: 'overwrite-feature-branch',
      build: '3',
      buildURL: 'https://example.semaphoreci.com/workflows/03d9de4c-c798-4df5-bbd5-786db9d4d309',
      commit: 'overwriteSha',
      job: '03d9de4c-c798-4df5-bbd5-786db9d4d309',
      pr: '4',
      service: 'semaphore',
      slug: 'overwriteOwner/overwriteRepo',
    }
    const params = await providerSemaphore.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })
})
