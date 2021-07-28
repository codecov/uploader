import { IServiceParams, UploaderInputs } from "../types"

export function detect(envs: NodeJS.ProcessEnv) {
  return !!envs.CIRRUS_CI
}

function _getBuild(inputs: UploaderInputs
) {
  const { args, envs } = inputs
  return args.build || envs.CIRRUS_BUILD_ID || ''
}

// eslint-disable-next-line no-unused-vars
function _getBuildURL(inputs: UploaderInputs
) {
  return ''
}

function _getBranch(inputs: UploaderInputs
) {
  const { args, envs } = inputs
  return args.branch || envs.CIRRUS_BRANCH || ''
}

function _getJob(envs: NodeJS.ProcessEnv) {
  return envs.CIRRUS_TASK_ID || ''
}

function _getPR(inputs: UploaderInputs
) {
  const { args, envs } = inputs
  return args.pr || envs.CIRRUS_PR || ''
}

function _getService() {
  return 'cirrus-ci'
}

export function getServiceName() {
  return 'Cirrus CI'
}

function _getSHA(inputs: UploaderInputs
) {
  const { args, envs } = inputs
  return args.sha || envs.CIRRUS_CHANGE_IN_REPO || ''
}

function _getSlug(inputs: UploaderInputs
) {
  const { args, envs } = inputs
  return args.slug || envs.CIRRUS_REPO_FULL_NAME || ''
}

export function getServiceParams(inputs: UploaderInputs
): IServiceParams{
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
