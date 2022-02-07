/**
 * https://docs.drone.io/runner/exec/configuration/reference/
 */
import { IServiceParams, UploaderEnvs, UploaderInputs } from '../types'

export function detect(envs: UploaderEnvs): boolean {
  return Boolean(envs.DRONE)
}

function _getBuild(inputs: UploaderInputs): string {
  const { args, environment: envs } = inputs
  return args.build || envs.DRONE_BUILD_NUMBER || ''
}

function _getBuildURL(inputs: UploaderInputs): string {
  const { environment: envs } = inputs
  return envs.DRONE_BUILD_LINK || envs.DRONE_BUILD_URL || envs.CI_BUILD_URL || ''
}

function _getBranch(inputs: UploaderInputs): string {
  const { args, environment: envs } = inputs
  return args.branch || envs.DRONE_BRANCH || ''
}

function _getJob(): string {
  return ''
}

function _getPR(inputs: UploaderInputs): string {
  const { args, environment: envs } = inputs
  return args.pr || envs.DRONE_PULL_REQUEST || ''
}

function _getService(): string {
  return 'drone.io'
}

export function getServiceName(): string {
  return 'Drone'
}

function _getSHA(inputs: UploaderInputs): string {
  const { args, environment: envs } = inputs
  return args.sha || envs.DRONE_COMMIT_SHA || ''
}

function _getSlug(inputs: UploaderInputs): string {
  const { args, environment: envs } = inputs
  if (args.slug !== '') return args.slug
  return envs.DRONE_REPO || ''
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
    'DRONE',
    'DRONE_BRANCH',
    'DRONE_BUILD_NUMBER',
    'DRONE_BUILD_URL',
    'DRONE_COMMIT_SHA',
    'DRONE_PULL_REQUEST',
    'DRONE_REPO',
  ]
}
