/**
 * https://woodpecker-ci.org/docs/usage/environment#built-in-environment-variables
 */
import { IServiceParams, UploaderEnvs, UploaderInputs } from '../types'

export function detect(envs: UploaderEnvs): boolean {
  return envs.CI === 'woodpecker'
}

function _getBuild(inputs: UploaderInputs): string {
  const { args, environment: envs } = inputs
  return args.build || envs.CI_BUILD_NUMBER || ''
}

function _getBuildURL(inputs: UploaderInputs): string {
  const { environment: envs } = inputs
  return envs.CI_BUILD_LINK || ''
}

function _getBranch(inputs: UploaderInputs): string {
  const { args, environment: envs } = inputs
  return args.branch || envs.CI_COMMIT_SOURCE_BRANCH || envs.CI_COMMIT_BRANCH || ''
}

function _getJob(inputs: UploaderInputs): string {
  const { environment: envs } = inputs
  return envs.CI_JOB_NUMBER || ''
}

function _getPR(inputs: UploaderInputs): string {
  const { args, environment: envs } = inputs
  return args.pr || envs.CI_COMMIT_PULL_REQUEST || ''
}

function _getService(): string {
  return 'woodpecker'
}

export function getServiceName(): string {
  return 'Woodpecker CI'
}

function _getSHA(inputs: UploaderInputs): string {
  const { args, environment: envs } = inputs
  return args.sha || envs.CI_COMMIT_SHA || ''
}

function _getTag(inputs: UploaderInputs): string {
  const { args, environment: envs } = inputs
  return args.tag || envs.CI_COMMIT_TAG || ''
}

function _getSlug(inputs: UploaderInputs): string {
  const { args, environment: envs } = inputs
  if (args.slug !== '') return args.slug
  return envs.CI_REPO || ''
}

export function getServiceParams(inputs: UploaderInputs): IServiceParams {
  return {
    branch: _getBranch(inputs),
    build: _getBuild(inputs),
    buildURL: _getBuildURL(inputs),
    commit: _getSHA(inputs),
    tag: _getTag(inputs),
    pr: _getPR(inputs),
    job: _getJob(inputs),
    service: _getService(),
    slug: _getSlug(inputs),
  }
}

export function getEnvVarNames(): string[] {
  return [
    'CI',
    'CI_BUILD_NUMBER',
    'CI_BUILD_LINK',
    'CI_COMMIT_SOURCE_BRANCH',
    'CI_COMMIT_BRANCH',
    'CI_JOB_NUMBER',
    'CI_COMMIT_PULL_REQUEST',
    'CI_COMMIT_SHA',
    'CI_COMMIT_TAG',
    'CI_REPO',
  ]
}
