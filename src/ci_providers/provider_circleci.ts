import { setSlug } from '../helpers/provider'
import { isSetAndNotEmpty } from '../helpers/util'
import { IServiceParams, UploaderEnvs, UploaderInputs } from '../types'

export function detect(envs: UploaderEnvs): boolean {
  return Boolean(envs.CI) && Boolean(envs.CIRCLECI)
}

function _getBuildURL(inputs: UploaderInputs): string {
  return inputs.environment['CIRCLE_BUILD_URL'] ?? ''
}

// This is the value that gets passed to the Codecov uploader
function _getService(): string {
  return 'circleci'
}

// This is the name that gets printed
export function getServiceName(): string {
  return 'CircleCI'
}

function _getBranch(inputs: UploaderInputs): string {
  const { args, environment: envs } = inputs
  return args.branch || envs.CIRCLE_BRANCH || ''
}

function _getSHA(inputs: UploaderInputs): string {
  const { args, environment: envs } = inputs
  return args.sha || envs.CIRCLE_SHA1 || ''
}

function _getSlug(inputs: UploaderInputs): string {
  const { args, environment: envs } = inputs

  const slug = setSlug(
    args.slug,
    envs.CIRCLE_PROJECT_USERNAME,
    envs.CIRCLE_PROJECT_REPONAME,
  )
  if (slug !== '') {
    return slug
  }

  if (isSetAndNotEmpty(envs.CIRCLE_REPOSITORY_URL)) {
    return `${envs.CIRCLE_REPOSITORY_URL?.split(':')[1]?.split('.git')[0]}`
  }
  return slug
}

function _getBuild(inputs: UploaderInputs): string {
  const { args, environment: envs } = inputs
  return args.build || envs.CIRCLE_BUILD_NUM || ''
}

function _getPR(inputs: UploaderInputs): string {
  const { args, environment: envs } = inputs
  return args.pr || envs.CIRCLE_PR_NUMBER || ''
}

function _getJob(envs: UploaderEnvs): string {
  return envs.CIRCLE_NODE_INDEX || ''
}

export function getServiceParams(inputs: UploaderInputs): IServiceParams {
  return {
    branch: _getBranch(inputs),
    build: _getBuild(inputs),
    buildURL: _getBuildURL(inputs),
    commit: _getSHA(inputs),
    job: _getJob(inputs.environment),
    pr: _getPR(inputs),
    service: _getService(),
    slug: _getSlug(inputs),
  }
}

export function getEnvVarNames(): string[] {
  return ['CI', 'CIRCLECI']
}
