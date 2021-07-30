import { parseSlugFromRemoteAddr } from '../helpers/git'
import { IServiceParams, UploaderEnvs, UploaderInputs } from '../types'

export function detect(envs: UploaderEnvs): boolean {
  return Boolean(envs.JENKINS_URL)
}

function _getBuild(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  return args.build || envs.BUILD_NUMBER || ''
}

function _getBuildURL(inputs: UploaderInputs): string {
  const { envs } = inputs
  return envs.BUILD_URL ? encodeURIComponent(envs.BUILD_URL || '') : ''
}

function _getBranch(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  return (
    args.branch ||
    envs.ghprbSourceBranch ||
    envs.GIT_BRANCH ||
    envs.BRANCH_NAME ||
    ''
  )
}

// eslint-disable-next-line no-unused-vars
function _getJob(envs: UploaderEnvs) {
  return ''
}

function _getPR(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  return args.pr || envs.ghprbPullId || envs.CHANGE_ID || ''
}

function _getService(): string {
  return 'jenkins'
}

export function getServiceName(): string {
  return 'Jenkins CI'
}

function _getSHA(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  return args.sha || envs.ghprbActualCommit || envs.GIT_COMMIT || ''
}

function _getSlug(inputs: UploaderInputs): string {
  const { args } = inputs
  return args.slug || parseSlugFromRemoteAddr('') || ''
}

export function getServiceParams(inputs: UploaderInputs): IServiceParams {
  return {
    branch: _getBranch(inputs),
    build: _getBuild(inputs),
    buildURL: _getBuildURL(inputs),
    commit: _getSHA(inputs),
    job: _getJob(inputs.envs),
    pr: _getPR(inputs),
    service: _getService(),
    slug: _getSlug(inputs),
  }
}
