import { IServiceParams, UploaderEnvs, UploaderInputs } from '../types'

export function detect(envs: UploaderEnvs): boolean {
  return (Boolean(envs.CI) && Boolean(envs.TRAVIS)) && (Boolean(envs.SHIPPABLE) === false)
}

function _getBuild(inputs: UploaderInputs): string {
  const { args, environment: envs } = inputs
  return args.build || envs.TRAVIS_JOB_NUMBER || ''
}

function _getBuildURL(): string {
  return ''
}

function _getBranch(inputs: UploaderInputs): string {
  const { args, environment: envs } = inputs

  let branch = ''
  if (envs.TRAVIS_BRANCH !== envs.TRAVIS_TAG) {
    branch = envs.TRAVIS_PULL_REQUEST_BRANCH || envs.TRAVIS_BRANCH || ''
  }
  return args.branch || branch
}

function _getJob(envs: UploaderEnvs): string {
  return envs.TRAVIS_JOB_ID || ''
}

function _getPR(inputs: UploaderInputs): string {
  const { args, environment: envs } = inputs
  return args.pr || envs.TRAVIS_PULL_REQUEST || ''
}

function _getService(): string {
  return 'travis'
}

export function getServiceName(): string {
  return 'Travis CI'
}

function _getSHA(inputs: UploaderInputs): string {
  const { args, environment: envs } = inputs
  return args.sha || envs.TRAVIS_PULL_REQUEST_SHA || envs.TRAVIS_COMMIT || ''
}

function _getSlug(inputs: UploaderInputs): string {
  const { args, environment: envs } = inputs
  if (args.slug !== '') return args.slug
  return envs.TRAVIS_REPO_SLUG || ''
}

export function getServiceParams(inputs: UploaderInputs): IServiceParams {
  return {
    branch: _getBranch(inputs),
    build: _getBuild(inputs),
    buildURL: _getBuildURL(),
    commit: _getSHA(inputs),
    job: _getJob(inputs.environment),
    pr: _getPR(inputs),
    service: _getService(),
    slug: _getSlug(inputs),
  }
}

export function getEnvVarNames(): string[] {
  return ['TRAVIS']
}
