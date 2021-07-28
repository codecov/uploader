import { IServiceParams, UploaderInputs } from "../types"

export function detect(envs: NodeJS.ProcessEnv) {
  return envs.WERCKER_MAIN_PIPELINE_STARTED
}

function _getBuild(inputs: UploaderInputs
) {
  const { args, envs } = inputs
  return args.build || envs.WERCKER_MAIN_PIPELINE_STARTED || ''
}

function _getBuildURL(inputs: UploaderInputs
) {
  const { envs } = inputs
  return envs.WERCKER_BUILD_URL || ''
}

function _getBranch(inputs: UploaderInputs
) {
  const { args, envs } = inputs

  return args.branch || envs.WERCKER_GIT_BRANCH || ''
}

// eslint-disable-next-line no-unused-vars
function _getJob(envs: NodeJS.ProcessEnv) {
  return ''
}

function _getPR(inputs: UploaderInputs
) {
  const { args } = inputs
  return args.pr || ''
}

function _getService() {
  return 'wercker'
}

export function getServiceName() {
  return 'Wercker CI'
}

function _getSHA(inputs: UploaderInputs
) {
  const { args, envs } = inputs
  return args.sha || envs.WERCKER_GIT_COMMIT || ''
}

function _getSlug(inputs: UploaderInputs
) {
  const { args, envs } = inputs
  return args.slug || `${envs.WERCKER_GIT_OWNER}/${envs.WERCKER_GIT_REPOSITORY}`
}

export function getServiceParams(inputs: UploaderInputs
) : IServiceParams{
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
