import td from 'testdouble'
import childProcess from 'child_process'

import * as providerGitHubactions from '../../src/ci_providers//provider_githubactions'
import { UploaderInputs } from '../../src/types'

describe('GitHub Actions Params', () => {
  afterEach(() => {
    td.reset()
  })

  describe('detect()', () => {
    it('does not run without GitHub Actions env variable', () => {
      const inputs: UploaderInputs = {
        args: {
          flags: '',
        },
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

    it('does not with GitHub Actions env variable', () => {
      const inputs = {
        args: {},
        envs: {
          GITHUB_ACTIONS: 'true',
        },
      }
      const detected = providerGitHubactions.detect(inputs.envs)
      expect(detected).toBeTruthy()
    })
  })

  it('gets correct params for a push event', () => {
    const inputs: UploaderInputs = {
      args: {
        tag: '',
        url: '',
        source: '',
        flags: ''
      },
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
    const expected = {
      branch: 'master',
      build: '2',
      buildURL:
        'https%3A%2F%2Fgithub.com%2FtestOrg%2FtestRepo%2Factions%2Fruns%2F2',
      commit: 'testingsha',
      job: 'testWorkflow',
      pr: '',
      service: 'github-actions',
      slug: 'testOrg/testRepo',
    }
    const params = providerGitHubactions.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  it('gets correct params for a PR', () => {
    const inputs: UploaderInputs = {
      args: {
        tag: '',
        url: '',
        source: '',
        flags: ''
      },
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
    const expected = {
      branch: 'branch',
      build: '2',
      buildURL:
        'https%3A%2F%2Fgithub.com%2FtestOrg%2FtestRepo%2Factions%2Fruns%2F2',
      commit: 'testingsha',
      job: 'testWorkflow',
      pr: '1',
      service: 'github-actions',
      slug: 'testOrg/testRepo',
    }

    const spawnSync = td.replace(childProcess, 'spawnSync')
    td.when(
      spawnSync('git', ['show', '--no-patch', '--format="%P"']),
    ).thenReturn({
      stdout: 'testingsha',
    })
    const params = providerGitHubactions.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  it('gets correct params for a merge', () => {
    const inputs: UploaderInputs = {
      args: {
        tag: '',
        url: '',
        source: '',
        flags: ''
      },
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
    const expected = {
      branch: 'branch',
      build: '2',
      buildURL:
        'https%3A%2F%2Fgithub.com%2FtestOrg%2FtestRepo%2Factions%2Fruns%2F2',
      commit: 'testingmergecommitsha2345678901234567890',
      job: 'testWorkflow',
      pr: '1',
      service: 'github-actions',
      slug: 'testOrg/testRepo',
    }

    const spawnSync = td.replace(childProcess, 'spawnSync')
    td.when(
      spawnSync('git', ['show', '--no-patch', '--format="%P"']),
    ).thenReturn({
      stdout:
        'testingsha123456789012345678901234567890 testingmergecommitsha2345678901234567890',
    })
    const params = providerGitHubactions.getServiceParams(inputs)
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
        flags: ''
      },
      envs: {
        GITHUB_ACTIONS: 'true',
        GITHUB_SERVER_URL: 'https://github.com',
      },
    }
    const expected = {
      branch: 'branch',
      build: '3',
      buildURL:
        'https%3A%2F%2Fgithub.com%2FtestOrg%2FtestRepo%2Factions%2Fruns%2F3',
      commit: 'testsha',
      job: '',
      pr: '2',
      service: 'github-actions',
      slug: 'testOrg/testRepo',
    }

    const spawnSync = td.replace(childProcess, 'spawnSync')
    td.when(
      spawnSync('git', ['show', '--no-patch', '--format="%P"']),
    ).thenReturn({ stdout: 'testsha' })
    const params = providerGitHubactions.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  it('gets an improper merge commit message', () => {
    const inputs: UploaderInputs = {
      args: {
        tag: '',
        url: '',
        source: '',
        flags: ''
      },
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
    const expected = {
      branch: 'branch',
      build: '2',
      buildURL:
        'https%3A%2F%2Fgithub.com%2FtestOrg%2FtestRepo%2Factions%2Fruns%2F2',
      commit: 'testingsha',
      job: 'testWorkflow',
      pr: '1',
      service: 'github-actions',
      slug: 'testOrg/testRepo',
    }

    const spawnSync = td.replace(childProcess, 'spawnSync')
    td.when(
      spawnSync('git', ['show', '--no-patch', '--format="%P"']),
    ).thenReturn({ stdout: '' })
    const params = providerGitHubactions.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })
})
