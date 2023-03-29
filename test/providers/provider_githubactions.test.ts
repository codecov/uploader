import td from 'testdouble'
import Undici from 'undici'
import childProcess from 'child_process'

import * as providerGitHubactions from '../../src/ci_providers/provider_githubactions'
import { SPAWNPROCESSBUFFERSIZE } from '../../src/helpers/constants'
import { IServiceParams, UploaderInputs } from '../../src/types'
import { createEmptyArgs } from '../test_helpers'

describe('GitHub Actions Params', () => {
  afterEach(() => {
    td.reset()
  })

  describe('detect()', () => {
    it('does not run without GitHub Actions env variable', () => {
      const inputs: UploaderInputs = {
        args: { ...createEmptyArgs() },
        environment: {
          GITHUB_REF: 'refs/heads/master',
          GITHUB_REPOSITORY: 'testOrg/testRepo',
          GITHUB_RUN_ID: '2',
          GITHUB_SHA: 'testingsha',
          GITHUB_WORKFLOW: 'testWorkflow',
        },
      }
      const detected = providerGitHubactions.detect(inputs.environment)
      expect(detected).toBeFalsy()
    })

    it('does not run with only the GitHub Actions env variable', () => {
      const inputs: UploaderInputs = {
        args: { ...createEmptyArgs() },
        environment: {
          GITHUB_ACTIONS: 'true',
        },
      }
      const detected = providerGitHubactions.detect(inputs.environment)
      expect(detected).toBeTruthy()
    })
  })

  it('gets correct params for a push event', async () => {
    const inputs: UploaderInputs = {
      args: { ...createEmptyArgs() },
      environment: {
        GITHUB_ACTIONS: 'true',
        GITHUB_REF: 'refs/heads/master',
        GITHUB_REPOSITORY: 'testOrg/testRepo',
        GITHUB_RUN_ID: '2',
        GITHUB_SERVER_URL: 'https://github.com',
        GITHUB_SHA: 'testingsha',
        GITHUB_WORKFLOW: 'testWorkflow',
      },
    }
    const expected: IServiceParams = {
      branch: 'master',
      build: '2',
      buildURL: 'https://github.com/testOrg/testRepo/actions/runs/2',
      commit: 'testingsha',
      job: 'testWorkflow',
      pr: '',
      service: 'github-actions',
      slug: 'testOrg/testRepo',
    }
    const params = await providerGitHubactions.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  it('gets correct params for a PR', async () => {
    const inputs: UploaderInputs = {
      args: { ...createEmptyArgs() },
      environment: {
        GITHUB_ACTIONS: 'true',
        GITHUB_HEAD_REF: 'branch',
        GITHUB_REF: 'refs/pull/1/merge',
        GITHUB_REPOSITORY: 'testOrg/testRepo',
        GITHUB_RUN_ID: '2',
        GITHUB_SERVER_URL: 'https://github.com',
        GITHUB_SHA: 'testingsha',
        GITHUB_WORKFLOW: 'testWorkflow',
      },
    }
    const expected: IServiceParams = {
      branch: 'branch',
      build: '2',
      buildURL: 'https://github.com/testOrg/testRepo/actions/runs/2',
      commit: 'testingsha',
      job: 'testWorkflow',
      pr: '1',
      service: 'github-actions',
      slug: 'testOrg/testRepo',
    }

    const spawnSync = td.replace(childProcess, 'spawnSync')
    td.when(
      spawnSync('git', ['show', '--no-patch', '--format=%P'], { maxBuffer: SPAWNPROCESSBUFFERSIZE }),
    ).thenReturn({
      stdout: 'testingsha',
    })
    const params = await providerGitHubactions.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  it('gets correct buildURL for a PR', async () => {
    const inputs: UploaderInputs = {
      args: { ...createEmptyArgs() },
      environment: {
        GITHUB_ACTIONS: 'true',
        GITHUB_HEAD_REF: 'branch',
        GITHUB_JOB: 'testJob',
        GITHUB_REF: 'refs/pull/1/merge',
        GITHUB_REPOSITORY: 'testOrg/testRepo',
        GITHUB_RUN_ID: '2',
        GITHUB_SERVER_URL: 'https://github.com',
        GITHUB_SHA: 'testingsha',
        GITHUB_WORKFLOW: 'testWorkflow',
      },
    }
    const expected: IServiceParams = {
      branch: 'branch',
      build: '2',
      buildURL: 'https://github.com/testOrg/testRepo/actions/runs/2',
      commit: 'testingsha',
      job: 'testWorkflow',
      pr: '1',
      service: 'github-actions',
      slug: 'testOrg/testRepo',
    }

    const spawnSync = td.replace(childProcess, 'spawnSync')
    td.when(
      spawnSync('git', ['show', '--no-patch', '--format=%P'], { maxBuffer: SPAWNPROCESSBUFFERSIZE }),
    ).thenReturn({
      stdout: 'testingsha',
    })

    const request = td.replace(Undici, 'request')
    td.when(
      request(
        'https://api.github.com/repos/testOrg/testRepo/actions/runs/2/jobs',
        {
          headers: { 'User-Agent': 'Awesome-Octocat-App' }
        }
      )
    ).thenReturn({
      statusCode: 200,
      body: {
        json: () => {
          return {
            'jobs': [{
              'id': 1,
              'name': 'fakeJob',
              'html_url': 'https://fake.com',
            }, {
              'id': 2,
              'name': 'seocondFakeJob',
              'html_url': 'https://github.com/testOrg/testRepo/actions/runs/2/jobs/2',
            }, {
              'id': 3,
              'name': 'anotherFakeJob',
              'html_url': 'https://example.com',
            }]
          }
        }
      }
    })

    const params = await providerGitHubactions.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  it('gets correct buildURL by default for a PR', async () => {
    const inputs: UploaderInputs = {
      args: { ...createEmptyArgs() },
      environment: {
        GITHUB_ACTIONS: 'true',
        GITHUB_HEAD_REF: 'branch',
        GITHUB_JOB: 'testJob',
        GITHUB_REF: 'refs/pull/1/merge',
        GITHUB_REPOSITORY: 'testOrg/testRepo',
        GITHUB_RUN_ID: '2',
        GITHUB_SERVER_URL: 'https://github.com',
        GITHUB_SHA: 'testingsha',
        GITHUB_WORKFLOW: 'testWorkflow',
      },
    }
    const expected: IServiceParams = {
      branch: 'branch',
      build: '2',
      buildURL: 'https://github.com/testOrg/testRepo/actions/runs/2/jobs/2',
      commit: 'testingsha',
      job: 'testWorkflow',
      pr: '1',
      service: 'github-actions',
      slug: 'testOrg/testRepo',
    }

    const spawnSync = td.replace(childProcess, 'spawnSync')
    td.when(
      spawnSync('git', ['show', '--no-patch', '--format=%P'], { maxBuffer: SPAWNPROCESSBUFFERSIZE }),
    ).thenReturn({
      stdout: 'testingsha',
    })
    const request = td.replace(Undici, 'request')
    td.when(
      request(
        'https://api.github.com/repos/testOrg/testRepo/actions/runs/2/jobs',
        {
          headers: { 'User-Agent': 'Awesome-Octocat-App' }
        }
      )
    ).thenReturn({
      statusCode: 200,
      body: {
        json: () => {
          return {
            'jobs': [{
              'id': 1,
              'name': 'fakeJob',
              'html_url': 'https://fake.com',
            }, {
              'id': 2,
              'name': 'testJob',
              'html_url': 'https://github.com/testOrg/testRepo/actions/runs/2/jobs/2',
            }, {
              'id': 3,
              'name': 'anotherFakeJob',
              'html_url': 'https://example.com',
            }]
          }
        }
      }
    })
    const params = await providerGitHubactions.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  it('gets correct params for a merge', async () => {
    const inputs: UploaderInputs = {
      args: { ...createEmptyArgs() },
      environment: {
        GITHUB_ACTIONS: 'true',
        GITHUB_HEAD_REF: 'branch',
        GITHUB_REF: 'refs/pull/1/merge',
        GITHUB_REPOSITORY: 'testOrg/testRepo',
        GITHUB_RUN_ID: '2',
        GITHUB_SERVER_URL: 'https://github.com',
        GITHUB_SHA: 'testingmergecommitsha',
        GITHUB_WORKFLOW: 'testWorkflow',
      },
    }
    const expected: IServiceParams = {
      branch: 'branch',
      build: '2',
      buildURL: 'https://github.com/testOrg/testRepo/actions/runs/2',
      commit: 'testingmergecommitsha2345678901234567890',
      job: 'testWorkflow',
      pr: '1',
      service: 'github-actions',
      slug: 'testOrg/testRepo',
    }

    const spawnSync = td.replace(childProcess, 'spawnSync')
    td.when(
      spawnSync('git', ['show', '--no-patch', '--format=%P'], { maxBuffer: SPAWNPROCESSBUFFERSIZE }),
    ).thenReturn({
      stdout:
        'testingsha123456789012345678901234567890 testingmergecommitsha2345678901234567890',
    })
    const params = await providerGitHubactions.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  it('gets correct params for overrides', async () => {
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
        GITHUB_ACTIONS: 'true',
        GITHUB_SERVER_URL: 'https://github.com',
      },
    }
    const expected: IServiceParams = {
      branch: 'branch',
      build: '3',
      buildURL: 'https://github.com/testOrg/testRepo/actions/runs/3',
      commit: 'testsha',
      job: '',
      pr: '2',
      service: 'github-actions',
      slug: 'testOrg/testRepo',
    }

    const spawnSync = td.replace(childProcess, 'spawnSync')
    td.when(
      spawnSync('git', ['show', '--no-patch', '--format=%P'], { maxBuffer: SPAWNPROCESSBUFFERSIZE }),
    ).thenReturn({ stdout: 'testsha' })
    const params = await providerGitHubactions.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  it('gets an improper merge commit message', async () => {
    const inputs: UploaderInputs = {
      args: { ...createEmptyArgs() },
      environment: {
        GITHUB_ACTIONS: 'true',
        GITHUB_HEAD_REF: 'branch',
        GITHUB_REF: 'refs/pull/1/merge',
        GITHUB_REPOSITORY: 'testOrg/testRepo',
        GITHUB_RUN_ID: '2',
        GITHUB_SERVER_URL: 'https://github.com',
        GITHUB_SHA: 'testingsha',
        GITHUB_WORKFLOW: 'testWorkflow',
      },
    }
    const expected: IServiceParams = {
      branch: 'branch',
      build: '2',
      buildURL: 'https://github.com/testOrg/testRepo/actions/runs/2',
      commit: 'testingsha',
      job: 'testWorkflow',
      pr: '1',
      service: 'github-actions',
      slug: 'testOrg/testRepo',
    }

    const spawnSync = td.replace(childProcess, 'spawnSync')
    td.when(
      spawnSync('git', ['show', '--no-patch', '--format=%P'], { maxBuffer: SPAWNPROCESSBUFFERSIZE }),
    ).thenReturn({ stdout: '' })
    const params = await providerGitHubactions.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })
})
