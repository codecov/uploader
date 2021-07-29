import { parseSlugFromRemoteAddr } from '../helpers/git'
import { IServiceParams, UploaderEnvs, UploaderInputs } from '../types'

export function detect(envs: UploaderEnvs): boolean {
  return !!envs.TEAMCITY_VERSION
}

// eslint-disable-next-line no-unused-vars
function _getBuildURL(inputs: UploaderInputs): string {
  return ''
}

// This is the value that gets passed to the Codecov uploader
function _getService(): string {
  return 'teamcity'
}

// This is the name that gets printed
export function getServiceName(): string {
  return 'TeamCity'
}

function _getBranch(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  return args.branch || envs.BRANCH_NAME?.toString() || ''
}

function _getSHA(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  return args.sha || envs.BUILD_VCS_NUMBER?.toString() || ''
}

function _getSlug(inputs: UploaderInputs): string {
  const { args } = inputs
  return args.slug || parseSlugFromRemoteAddr('') || ''
}

function _getBuild(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  return args.build || envs.BUILD_NUMBER?.toString() || ''
}

function _getPR(inputs: UploaderInputs): string {
  const { args } = inputs
  return args.pr || ''
}

// eslint-disable-next-line no-unused-vars
function _getJob(envs: UploaderEnvs): string {
  return ''
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
