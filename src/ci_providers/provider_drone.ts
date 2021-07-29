import { IServiceParams, UploaderEnvs, UploaderInputs } from '../types'

export function detect(envs: UploaderEnvs): boolean {
  return !!envs.DRONE
}

function _getBuild(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  return args.build || envs.DRONE_BUILD_NUMBER?.toString() || ''
}

function _getBuildURL(inputs: UploaderInputs): string {
  const { envs } = inputs
  return envs.DRONE_BUILD_URL?.toString() || ''
}

function _getBranch(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  return args.branch || envs.DRONE_BRANCH?.toString() || ''
}

// eslint-disable-next-line no-unused-vars
function _getJob(envs: UploaderEnvs): string {
  return ''
}

function _getPR(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  return args.pr || envs.DRONE_PULL_REQUEST?.toString() || ''
}

function _getService(): string {
  return 'drone'
}

export function getServiceName(): string {
  return 'Drone'
}

function _getSHA(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  return args.sha || envs.DRONE_COMMIT_SHA?.toString() || ''
}

function _getSlug(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  return args.slug || envs.DRONE_REPO_LINK?.toString() || ''
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
