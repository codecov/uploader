import { parseSlugFromRemoteAddr } from '../helpers/git'
import { IServiceParams, UploaderInputs } from '../types'

export function detect(envs: NodeJS.ProcessEnv) {
  return !!envs.TEAMCITY_VERSION
}

// eslint-disable-next-line no-unused-vars
function _getBuildURL(inputs: UploaderInputs
) {
  return ''
}

// This is the value that gets passed to the Codecov uploader
function _getService() {
  return 'teamcity'
}

// This is the name that gets printed
export function getServiceName() {
  return 'TeamCity'
}

function _getBranch(inputs: UploaderInputs
) {
  const { args, envs } = inputs
  return args.branch || envs.BRANCH_NAME || ''
}

function _getSHA(inputs: UploaderInputs
) {
  const { args, envs } = inputs
  return args.sha || envs.BUILD_VCS_NUMBER || ''
}

function _getSlug(inputs: UploaderInputs
) {
  const { args } = inputs
  return args.slug || parseSlugFromRemoteAddr('') || ''
}

function _getBuild(inputs: UploaderInputs
) {
  const { args, envs } = inputs
  return args.build || envs.BUILD_NUMBER || ''
}

function _getPR(inputs: UploaderInputs
) {
  const { args } = inputs
  return args.pr || ''
}

// eslint-disable-next-line no-unused-vars
function _getJob(envs: NodeJS.ProcessEnv) {
  return ''
}

export function getServiceParams(inputs: UploaderInputs
): IServiceParams {
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
