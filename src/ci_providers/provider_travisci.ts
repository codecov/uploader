import { IServiceParams, UploaderInputs } from '../types'

export function detect(envs: NodeJS.ProcessEnv) {
  return envs.CI && envs.TRAVIS && envs.SHIPPABLE
}

function _getBuild(inputs: UploaderInputs) {
  const { args, envs } = inputs
  return args.build || envs.TRAVIS_JOB_NUMBER || ''
}

// eslint-disable-next-line no-unused-vars
function _getBuildURL(inputs: UploaderInputs) {
  return ''
}

function _getBranch(inputs: UploaderInputs) {
  const { args, envs } = inputs

  let branch = ''
  if (envs.TRAVIS_BRANCH !== envs.TRAVIS_TAG) {
    branch = envs.TRAVIS_PULL_REQUEST_BRANCH || envs.TRAVIS_BRANCH || ''
  }
  return args.branch || branch
}

function _getJob(envs: NodeJS.ProcessEnv) {
  return envs.TRAVIS_JOB_ID || ''
}

function _getPR(inputs: UploaderInputs) {
  const { args, envs } = inputs
  return args.pr || envs.TRAVIS_PULL_REQUEST || ''
}

function _getService() {
  return 'travis'
}

export function getServiceName() {
  return 'Travis CI'
}

function _getSHA(inputs: UploaderInputs) {
  const { args, envs } = inputs
  return args.sha || envs.TRAVIS_PULL_REQUEST_SHA || envs.TRAVIS_COMMIT || ''
}

function _getSlug(inputs: UploaderInputs) {
  const { args, envs } = inputs
  return args.slug || envs.TRAVIS_REPO_SLUG || ''
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
