import { parseSlugFromRemoteAddr } from '../helpers/git'
import { IServiceParams, UploaderEnvs, UploaderInputs } from '../types'

export function detect(envs: UploaderEnvs): boolean {
  return Boolean(envs.CI) && Boolean(envs.HEROKU_TEST_RUN_BRANCH)
}

function _getBuild(inputs: UploaderInputs): string {
  const { args, environment: envs} = inputs
  return args.build || envs.HEROKU_TEST_RUN_ID || ''
}

function _getBuildURL(): string {
  return ''
}

function _getBranch(inputs: UploaderInputs): string {
  const { args, environment: envs} = inputs
  return args.branch || envs.HEROKU_TEST_RUN_BRANCH || ''
}

function _getJob() {
  return ''
}

function _getPR(inputs: UploaderInputs): string {
  const { args } = inputs
  return args.pr || ''
}

function _getService(): string {
  return 'heroku'
}

export function getServiceName(): string {
  return 'Heroku CI'
}

function _getSHA(inputs: UploaderInputs): string {
  const { args, environment: envs} = inputs
  return args.sha || envs.HEROKU_TEST_RUN_COMMIT_VERSION || ''
}

function _getSlug(inputs: UploaderInputs): string {
  const { args } = inputs
  if (args.slug !== '') return args.slug
  return parseSlugFromRemoteAddr('') || ''
}

export function getServiceParams(inputs: UploaderInputs): IServiceParams {
  return {
    branch: _getBranch(inputs),
    build: _getBuild(inputs),
    buildURL: _getBuildURL(),
    commit: _getSHA(inputs),
    job: _getJob(),
    pr: _getPR(inputs),
    service: _getService(),
    slug: _getSlug(inputs),
  }
}

export function getEnvVarNames(): string[] {
  return [
    'CI',
    'HEROKU_TEST_RUN_BRANCH',
    'HEROKU_TEST_RUN_COMMIT_VERSION',
    'HEROKU_TEST_RUN_ID',
  ]
}
