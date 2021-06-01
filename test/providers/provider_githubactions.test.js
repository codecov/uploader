const td = require('testdouble')
const childProcess = require('child_process')

const providerGitHubactions = require('../../src/ci_providers//provider_githubactions')

describe('GitHub Actions Params', () => {
  afterEach(function () {
    td.reset()
  })

  it('gets correct params for a push event', () => {
    const inputs = {
      args: {},
      envs: {
        GITHUB_ACTIONS: true,
        GITHUB_REF: 'refs/heads/master',
        GITHUB_REPOSITORY: 'testOrg/testRepo',
        GITHUB_RUN_ID: 2,
        GITHUB_SHA: 'testingSHA',
        GITHUB_WORKFLOW: 'testWorkflow',
      }
    }
    const expected = {
      branch: 'master',
      build: 2 ,
      buildURL: 'https%3A%2F%2Fgithub.com%2FtestOrg%2FtestRepo%2Factions%2Fruns%2F2',
      commit: 'testingSHA',
      job: 'testWorkflow',
      pr: '',
      service: 'github-actions',
      slug: 'testOrg/testRepo'
    }
    const params = providerGitHubactions.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  it('gets correct params for a PR', () => {
    const inputs = {
      args: {},
      envs: {
        GITHUB_ACTIONS: true,
        GITHUB_HEAD_REF: 'branch',
        GITHUB_REF: 'refs/pull/1/merge',
        GITHUB_REPOSITORY: 'testOrg/testRepo',
        GITHUB_RUN_ID: 2,
        GITHUB_SHA: 'testingSHA',
        GITHUB_WORKFLOW: 'testWorkflow',
      }
    }
    const expected = {
      branch: 'branch',
      build: 2 ,
      buildURL: 'https%3A%2F%2Fgithub.com%2FtestOrg%2FtestRepo%2Factions%2Fruns%2F2',
      commit: 'testingSHA',
      job: 'testWorkflow',
      pr: '1',
      service: 'github-actions',
      slug: 'testOrg/testRepo'
    }

    const params = providerGitHubactions.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  it('gets correct params for a merge', () => {
    const inputs = {
      args: {},
      envs: {
        GITHUB_ACTIONS: true,
        GITHUB_HEAD_REF: 'branch',
        GITHUB_REF: 'refs/pull/1/merge',
        GITHUB_REPOSITORY: 'testOrg/testRepo',
        GITHUB_RUN_ID: 2,
        GITHUB_SHA: 'testingSHA',
        GITHUB_WORKFLOW: 'testWorkflow',
      }
    }
    const expected = {
      branch: 'branch',
      build: 2 ,
      buildURL: 'https%3A%2F%2Fgithub.com%2FtestOrg%2FtestRepo%2Factions%2Fruns%2F2',
      commit: 'testingMergeCommitSHA',
      job: 'testWorkflow',
      pr: '1',
      service: 'github-actions',
      slug: 'testOrg/testRepo'
    }

    jest.mock("child_process", () => {
      return {
        execSync: () => "testingSHA testingMergeCommitSHA"
      }
    })
    const spawnSync = td.replace(childProcess, 'spawnSync')
    td.when(spawnSync('git', [
      'show',
      '--no-patch',
      '--format="%P"',
      '2>/dev/null',
      '||',
      'echo ""',
    ])).thenReturn({
      stdout: "testingSHA testingMergeCommitSHA"
    })
    const params = providerGitHubactions.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })
  /*
  it('gets correct params for overrides')
  */
})
