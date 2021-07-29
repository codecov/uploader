import { IServiceParams, UploaderEnvs, UploaderInputs } from '../types'

export function detect(envs: UploaderEnvs): boolean {
  return !!envs.CIRRUS_CI
}

function _getBuild(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  return args.build || envs.CIRRUS_BUILD_ID?.toString() || ''
}

// eslint-disable-next-line no-unused-vars
function _getBuildURL(inputs: UploaderInputs): string {
  return ''
}

function _getBranch(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  return args.branch || envs.CIRRUS_BRANCH?.toString() || ''
}

function _getJob(envs: UploaderEnvs): string {
  return envs.CIRRUS_TASK_ID?.toString() || ''
}

function _getPR(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  return args.pr || envs.CIRRUS_PR?.toString() || ''
}

function _getService(): string {
  return 'cirrus-ci'
}

export function getServiceName(): string {
  return 'Cirrus CI'
}

function _getSHA(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  return args.sha || envs.CIRRUS_CHANGE_IN_REPO?.toString() || ''
}

function _getSlug(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  return args.slug || envs.CIRRUS_REPO_FULL_NAME?.toString() || ''
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
