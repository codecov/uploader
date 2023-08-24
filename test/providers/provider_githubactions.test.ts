import td from 'testdouble'
import { Dispatcher, MockAgent, getGlobalDispatcher, setGlobalDispatcher } from 'undici'
import childProcess from 'child_process'

import * as providerGitHubactions from '../../src/ci_providers/provider_githubactions'
import { SPAWNPROCESSBUFFERSIZE } from '../../src/helpers/constants'
import { IServiceParams, UploaderInputs } from '../../src/types'
import { createEmptyArgs } from '../test_helpers'

describe('GitHub Actions Params', () => {

  let dispatcher: Dispatcher

  afterEach(() => {
    td.reset()
    setGlobalDispatcher(dispatcher)
  })

  beforeEach(() => {
    dispatcher = getGlobalDispatcher()
  })

  describe('detect()', () => {
    it('does not run without GitHub Actions env variable', () => {
      const inputs: UploaderInputs = {
        args: { ...createEmptyArgs() },
        envs: {
          GITHUB_REF: 'refs/heads/master',
          GITHUB_REPOSITORY: 'testOrg/testRepo',
          GITHUB_RUN_ID: '2',
          GITHUB_SHA: 'testingsha',
          GITHUB_WORKFLOW: 'testWorkflow',
        },
      }
      const detected = providerGitHubactions.detect(inputs.envs)
      expect(detected).toBeFalsy()
    })

    it('does not run with only the GitHub Actions env variable', () => {
      const inputs: UploaderInputs = {
        args: { ...createEmptyArgs() },
        envs: {
          GITHUB_ACTIONS: 'true',
        },
      }
      const detected = providerGitHubactions.detect(inputs.envs)
      expect(detected).toBeTruthy()
    })
  })

  it('gets correct params for a push event', async () => {
    const inputs: UploaderInputs = {
      args: { ...createEmptyArgs() },
      envs: {
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
      envs: {
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
      stdout: Buffer.from('testingsha'),
    })
    const params = await providerGitHubactions.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  it('gets correct buildURL for a PR', async () => {
    const inputs: UploaderInputs = {
      args: { ...createEmptyArgs() },
      envs: {
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
      stdout: Buffer.from('testingsha'),
    })

    const mockAgent = new MockAgent()
    setGlobalDispatcher(mockAgent)

    const mockPool = mockAgent.get('https://api.github.com')
    mockPool.intercept({
      path: '/repos/testOrg/testRepo/actions/runs/2/jobs'
    }).reply(200, {
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
    })

    const params = await providerGitHubactions.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  it('gets correct buildURL by default for a PR', async () => {
    const inputs: UploaderInputs = {
      args: { ...createEmptyArgs() },
      envs: {
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
      stdout: Buffer.from('testingsha'),
    })

    const mockAgent = new MockAgent()
    setGlobalDispatcher(mockAgent)

    const mockPool = mockAgent.get('https://api.github.com')
    mockPool.intercept({
      path: '/repos/testOrg/testRepo/actions/runs/2/jobs'
    }).reply(200, {
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
    })

    const params = await providerGitHubactions.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  it('gets correct params for a merge', async () => {
    const inputs: UploaderInputs = {
      args: { ...createEmptyArgs() },
      envs: {
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
        Buffer.from('testingsha123456789012345678901234567890 testingmergecommitsha2345678901234567890'),
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
      envs: {
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
    ).thenReturn({ stdout: Buffer.from('testsha') })
    const params = await providerGitHubactions.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  it('gets an improper merge commit message', async () => {
    const inputs: UploaderInputs = {
      args: { ...createEmptyArgs() },
      envs: {
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
    ).thenReturn({ stdout: Buffer.from('') })
    const params = await providerGitHubactions.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })
})
