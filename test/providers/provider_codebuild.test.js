const td = require('testdouble')

const providerCodeBuild = require('../../src/ci_providers/provider_codebuild')

describe('CodeBuild Params', () => {
  afterEach(() => {
    td.reset()
  })

  describe('detect()', () => {
    it('does not run without CodeBuild env variable', () => {
      const inputs = {
        args: {},
        envs: {},
      }
      const detected = providerCodeBuild.detect(inputs.envs)
      expect(detected).toBeFalsy()
    })

    it('does run with CodeBuild env variable', () => {
      const inputs = {
        args: {},
        envs: {
          CI: true,
          CODEBUILD_CI: true,
        },
      }
      const detected = providerCodeBuild.detect(inputs.envs)
      expect(detected).toBeTruthy()
    })
  })

  it('gets correct params', () => {
    const inputs = {
      args: {},
      envs: {
        CI: true,
        CODEBUILD_CI: true,
        CODEBUILD_WEBHOOK_HEAD_REF: 'refs/heads/master',
        CODEBUILD_RESOLVED_SOURCE_VERSION: 'testingsha',
        CODEBUILD_BUILD_ID: 2,
        CODEBUILD_SOURCE_VERSION: 'pr/1',
        CODEBUILD_SOURCE_REPO_URL: 'https://github.com/repo.git',
      },
    }
    const expected = {
      branch: 'master',
      build: 2,
      buildURL: '',
      commit: 'testingsha',
      job: 2,
      pr: '1',
      service: 'codebuild',
      slug: 'repo',
    }
    const params = providerCodeBuild.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })
})
