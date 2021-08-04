import td from 'testdouble'

import * as providerCodeBuild from '../../src/ci_providers/provider_codebuild'
import { IServiceParams, UploaderInputs } from '../../src/types'

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
      const inputs: UploaderInputs = {
        args: {
          tag: '',
          source: '',
          url: '',
          flags: '',
        },
        envs: {
          CI: 'true',
          CODEBUILD_CI: 'true',
        },
      }
      const detected = providerCodeBuild.detect(inputs.envs)
      expect(detected).toBeTruthy()
    })
  })

  describe('getServiceParams()', () => {
    it('gets correct params', () => {
      const inputs = {
        args: {
          tag: '',
          source: '',
          url: '',
          flags: '',
        },
        envs: {
          CI: 'true',
          CODEBUILD_CI: 'true',
          CODEBUILD_WEBHOOK_HEAD_REF: 'refs/heads/master',
          CODEBUILD_RESOLVED_SOURCE_VERSION: 'testingsha',
          CODEBUILD_BUILD_ID: '2',
          CODEBUILD_SOURCE_VERSION: 'pr/1',
          CODEBUILD_SOURCE_REPO_URL: 'https://github.com/repo.git',
        },
      }
      const expected: IServiceParams = {
        branch: 'master',
        build: '2',
        buildURL: '',
        commit: 'testingsha',
        job: '2',
        pr: 1,
        service: 'codebuild',
        slug: 'repo',
      }
      const params = providerCodeBuild.getServiceParams(inputs)
      expect(params).toMatchObject(expected)
    })

    it('gets correct params for overrides', () => {
      const inputs = {
        args: {
          branch: 'branch',
          build: '3',
          pr: '7',
          sha: 'testsha',
          slug: 'testOrg/testRepo',
          tag: '',
          source: '',
          url: '',
          flags: '',
        },
        envs: {
          CI: 'true',
          CODEBUILD_CI: 'true',
          CODEBUILD_WEBHOOK_HEAD_REF: 'refs/heads/master',
          CODEBUILD_RESOLVED_SOURCE_VERSION: 'testingsha',
          CODEBUILD_BUILD_ID: '2',
          CODEBUILD_SOURCE_VERSION: 'pr/1',
          CODEBUILD_SOURCE_REPO_URL: 'https://github.com/repo.git',
        },
      }
      const expected: IServiceParams = {
        branch: 'branch',
        build: '3',
        buildURL: '',
        commit: 'testsha',
        job: '2',
        pr: 7,
        service: 'codebuild',
        slug: 'testOrg/testRepo',
      }

      const params = providerCodeBuild.getServiceParams(inputs)
      expect(params).toMatchObject(expected)
    })
  })
})
