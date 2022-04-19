import td from 'testdouble'
import childProcess from 'child_process'

import * as providerGitLabci from '../../src/ci_providers//provider_gitlabci'
import { SPAWNPROCESSBUFFERSIZE } from '../../src/helpers/util'
import { IServiceParams, UploaderInputs } from '../../src/types'
import { createEmptyArgs } from '../test_helpers'

describe('GitLabCI Params', () => {
  afterEach(() => {
    td.reset()
  })

  describe('detect()', () => {
    it('does not run without GitLabCI env variable', () => {
      const inputs: UploaderInputs = {
        args: { ...createEmptyArgs() },
        environment: {},
      }
      const detected = providerGitLabci.detect(inputs.environment)
      expect(detected).toBeFalsy()
    })

    it('does run with GitLabCI env variable', () => {
      const inputs: UploaderInputs = {
        args: { ...createEmptyArgs() },
        environment: {
          GITLAB_CI: 'true',
        },
      }
      const detected = providerGitLabci.detect(inputs.environment)
      expect(detected).toBeTruthy()
    })
  })

  it('gets correct empty params', () => {
    const inputs: UploaderInputs = {
      args: { ...createEmptyArgs() },
      environment: {
        GITLAB_CI: 'true',
      },
    }
    const expected: IServiceParams = {
      branch: '',
      build: '',
      buildURL: '',
      commit: '',
      job: '',
      pr: '',
      service: 'gitlab',
      slug: '',
    }
    const spawnSync = td.replace(childProcess, 'spawnSync')
    td.when(
      spawnSync('git', ['config', '--get', 'remote.origin.url'], { maxBuffer: SPAWNPROCESSBUFFERSIZE }),
    ).thenReturn({ stdout: '' })
    const params = providerGitLabci.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  it('gets correct initial params', () => {
    const inputs: UploaderInputs = {
      args: { ...createEmptyArgs() },
      environment: {
        CI_BUILD_ID: '1',
        CI_BUILD_REF: 'testingsha',
        CI_BUILD_REF_NAME: 'main',
        CI_COMMIT_REF_NAME: 'master',
        CI_COMMIT_SHA: 'testsha',
        CI_JOB_ID: '2',
        CI_PROJECT_PATH: 'testOrg/testRepo',
        GITLAB_CI: 'true',
      },
    }
    const expected: IServiceParams = {
      branch: 'main',
      build: '1',
      buildURL: '',
      commit: 'testingsha',
      job: '',
      pr: '',
      service: 'gitlab',
      slug: 'testOrg/testRepo',
    }
    const params = providerGitLabci.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  it('gets correct second params', () => {
    const inputs: UploaderInputs = {
      args: { ...createEmptyArgs() },
      environment: {
        CI_COMMIT_REF_NAME: 'master',
        CI_COMMIT_SHA: 'testsha',
        CI_JOB_ID: '2',
        CI_PROJECT_PATH: 'testOrg/testRepo',
        GITLAB_CI: 'true',
      },
    }
    const expected: IServiceParams = {
      branch: 'master',
      build: '2',
      buildURL: '',
      commit: 'testsha',
      job: '',
      pr: '',
      service: 'gitlab',
      slug: 'testOrg/testRepo',
    }
    const params = providerGitLabci.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  describe('getSlug()', () => {
    const inputs: UploaderInputs = {
      args: { ...createEmptyArgs() },
      environment: {
        GITLAB_CI: 'true',
      },
    }

    it('can get the slug from http', () => {
      inputs.environment.CI_BUILD_REPO =
        'https://gitlab.com/testOrg/testRepo.git'
      const params = providerGitLabci.getServiceParams(inputs)
      expect(params.slug).toBe('testOrg/testRepo')
    })

    it('can get the slug from git url', () => {
      inputs.environment.CI_BUILD_REPO = 'git@gitlab.com:testOrg/testRepo.git'
      const params = providerGitLabci.getServiceParams(inputs)
      expect(params.slug).toBe('testOrg/testRepo')
    })

    it('can get the slug from git config', () => {
      inputs.environment.CI_BUILD_REPO = ''
      const spawnSync = td.replace(childProcess, 'spawnSync')
      td.when(
        spawnSync('git', ['config', '--get', 'remote.origin.url'], { maxBuffer: SPAWNPROCESSBUFFERSIZE }),
      ).thenReturn({ stdout: 'https://gitlab.com/testOrg/testRepo.git' })

      const params = providerGitLabci.getServiceParams(inputs)
      expect(params.slug).toBe('testOrg/testRepo')
    })

    it('can get the slug from git config as /', () => {
      inputs.environment.CI_BUILD_REPO = ''
      const spawnSync = td.replace(childProcess, 'spawnSync')
      td.when(
        spawnSync('git', ['config', '--get', 'remote.origin.url'], { maxBuffer: SPAWNPROCESSBUFFERSIZE }),
      ).thenReturn({ stdout: 'git@gitlab.com:/' })

      const params = providerGitLabci.getServiceParams(inputs)
      expect(params.slug).toBe('')
    })

    it('can handle no remote origin url', () => {
      inputs.environment.CI_BUILD_REPO = ''
      const spawnSync = td.replace(childProcess, 'spawnSync')
      td.when(
        spawnSync('git', ['config', '--get', 'remote.origin.url'], { maxBuffer: SPAWNPROCESSBUFFERSIZE }),
      ).thenReturn({ stdout: '' })

      const params = providerGitLabci.getServiceParams(inputs)
      expect(params.slug).toBe('')
    })
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
        GITLAB_CI: 'true',
      },
    }
    const expected: IServiceParams = {
      branch: 'branch',
      build: '3',
      buildURL: '',
      commit: 'testsha',
      job: '',
      pr: '2',
      service: 'gitlab',
      slug: 'testOrg/testRepo',
    }

    const params = providerGitLabci.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })
})
