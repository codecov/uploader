/**
 * https://cirrus-ci.org/guide/writing-tasks/#environment-variables
 */
import { setSlug } from '../helpers/provider'
import { IServiceParams, UploaderEnvs, UploaderInputs } from '../types'

export function detect(envs: UploaderEnvs): boolean {
  return Boolean(envs.CIRRUS_CI)
}

function _getBuild(inputs: UploaderInputs): string {
  const { args, environment: envs } = inputs
  return args.build || envs.CIRRUS_BUILD_ID || ''
}

function _getBuildURL(): string {
  return ''
}

function _getBranch(inputs: UploaderInputs): string {
  const { args, environment: envs } = inputs
  return args.branch || envs.CIRRUS_BRANCH || ''
}

function _getJob(envs: UploaderEnvs): string {
  return envs.CIRRUS_TASK_ID || ''
}

function _getPR(inputs: UploaderInputs): string {
  const { args, environment: envs } = inputs
  return args.pr || envs.CIRRUS_PR || ''
}

function _getService(): string {
  return 'cirrus-ci'
}

export function getServiceName(): string {
  return 'Cirrus CI'
}

function _getSHA(inputs: UploaderInputs): string {
  const { args, environment: envs } = inputs
  return args.sha || envs.CIRRUS_CHANGE_IN_REPO || ''
}

function _getSlug(inputs: UploaderInputs): string {
  const { args, environment: envs } = inputs
  return setSlug(args.slug, envs.CIRRUS_REPO_OWNER, envs.CIRRUS_REPO_NAME)
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
  return ['CIRRUS_CI']
}
