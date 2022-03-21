import { IServiceParams, UploaderEnvs, UploaderInputs } from '../types'

import { parseSlugFromRemoteAddr } from '../helpers/git'

export function detect(envs: UploaderEnvs): boolean {
  return Boolean(envs.CI) && Boolean(envs.BITRISE_IO)
}

function _getBuild(inputs: UploaderInputs): string {
  const { args, environment: envs } = inputs
  return args.build || envs.BITRISE_BUILD_NUMBER || ''
}

function _getBuildURL(inputs: UploaderInputs): string {
  const { environment: envs } = inputs
  return envs.BITRISE_BUILD_URL || ''
}

function _getBranch(inputs: UploaderInputs): string {
  const { args, environment: envs } = inputs
  return args.branch || envs.BITRISE_GIT_BRANCH || ''
}

function _getJob() {
  return ''
}

function _getPR(inputs: UploaderInputs): string {
  const { args, environment: envs } = inputs
  return args.pr || envs.BITRISE_PULL_REQUEST || ''
}

function _getService(): string {
  return 'bitrise'
}

export function getServiceName(): string {
  return 'Bitrise CI'
}

function _getSHA(inputs: UploaderInputs): string {
  const { args, environment: envs } = inputs
  return args.sha || envs.GIT_CLONE_COMMIT_HASH || ''
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
    job: _getJob(),
    pr: _getPR(inputs),
    service: _getService(),
    slug: _getSlug(inputs),
  }
}

export function getEnvVarNames(): string[] {
  return [
    'BITRISE_BUILD_NUMBER',
    'BITRISE_BUILD_URL',
    'BITRISE_GIT_BRANCH',
    'BITRISE_IO',
    'BITRISE_PULL_REQUEST',
    'CI',
    'GIT_CLONE_COMMIT_HASH',
  ]
}
