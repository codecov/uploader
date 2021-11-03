import { setSlug } from '../helpers/provider'
import { IServiceParams, UploaderEnvs, UploaderInputs } from '../types'

export function detect(envs: UploaderEnvs): boolean {
  return Boolean(envs.WERCKER_MAIN_PIPELINE_STARTED)
}

function _getBuild(inputs: UploaderInputs): string {
  const { args, environment: envs } = inputs
  return args.build || envs.WERCKER_MAIN_PIPELINE_STARTED || ''
}

function _getBuildURL(inputs: UploaderInputs): string {
  const { environment: envs } = inputs
  return envs.WERCKER_BUILD_URL || ''
}

function _getBranch(inputs: UploaderInputs): string {
  const { args, environment: envs } = inputs

  return args.branch || envs.WERCKER_GIT_BRANCH || ''
}

function _getJob(): string {
  return ''
}

function _getPR(inputs: UploaderInputs): string {
  const { args } = inputs
  return args.pr || ''
}

function _getService(): string {
  return 'wercker'
}

export function getServiceName(): string {
  return 'Wercker CI'
}

function _getSHA(inputs: UploaderInputs): string {
  const { args, environment: envs } = inputs
  return args.sha || envs.WERCKER_GIT_COMMIT || ''
}

function _getSlug(inputs: UploaderInputs): string {
  const { args, environment: envs } = inputs
  return setSlug(args.slug, envs.WERCKER_GIT_OWNER, envs.WERCKER_GIT_REPOSITORY)
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
  return ['WERCKER_MAIN_PIPELINE_STARTED']
}
