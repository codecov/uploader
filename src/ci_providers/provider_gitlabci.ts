import { IServiceParams, UploaderInputs } from "../types"

const { parseSlugFromRemoteAddr } = require('../helpers/git')

export function detect(envs: NodeJS.ProcessEnv) {
  return envs.GITLAB_CI
}

function _getBuild(inputs: UploaderInputs
) {
  const { args, envs } = inputs
  return args.build || envs.CI_BUILD_ID || envs.CI_JOB_ID || ''
}

// eslint-disable-next-line no-unused-vars
function _getBuildURL(inputs: UploaderInputs
) {
  return ''
}

function _getBranch(inputs: UploaderInputs
) {
  const { args, envs } = inputs
  return args.branch || envs.CI_BUILD_REF_NAME || envs.CI_COMMIT_REF_NAME || ''
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
  return 'gitlab'
}

export function getServiceName() {
  return 'GitLab CI'
}

function _getSHA(inputs: UploaderInputs
) {
  const { args, envs } = inputs
  return args.sha || envs.CI_BUILD_REF || envs.CI_COMMIT_SHA || ''
}

function _getSlug(inputs: UploaderInputs
) {
  const { args, envs } = inputs
  const remoteAddr = envs.CI_BUILD_REPO || envs.CI_REPOSITORY_URL
  return (
    args.slug ||
    envs.CI_PROJECT_PATH ||
    parseSlugFromRemoteAddr(remoteAddr) ||
    ''
  )
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
