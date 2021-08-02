import { logAndThrow } from '../helpers/util'
import { UploaderInputs, IServiceParams, UploaderEnvs } from '../types'

export function detect(envs: UploaderEnvs): boolean {
  return Boolean(envs.CI) && Boolean(envs.CIRCLECI)
}

// eslint-disable-next-line no-unused-vars
function _getBuildURL(inputs: UploaderInputs): string {
  return ''
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
  const { args, envs } = inputs
  return args.branch || envs.CIRCLE_BRANCH || ''
}

function _getSHA(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  return args.sha || envs.CIRCLE_SHA1 || ''
}

function _getSlug(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  let slug = args.slug || ''
  if (slug !== '') {
    return slug
  }
  if (envs.CIRCLE_PROJECT_REPONAME !== '') {
    slug = `${envs.CIRCLE_PROJECT_USERNAME}/${envs.CIRCLE_PROJECT_REPONAME}`
  } else {
    if (envs.CIRCLE_REPOSITORY_URL) {
      slug = `${
        envs.CIRCLE_REPOSITORY_URL.split(':')[1].split('.git')[0]
      }`
    } else {
      logAndThrow(
        'Unable to detect slug from env. Please set manually with the -r flag',
      )
    }
  }
  return args.slug || slug
}

function _getBuild(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  return args.build || envs.CIRCLE_BUILD_NUM || ''
}

function _getPR(inputs: UploaderInputs): string {
  const { args, envs } = inputs
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
    job: _getJob(inputs.envs),
    pr: _getPR(inputs),
    service: _getService(),
    slug: _getSlug(inputs),
  }
}

export function getEnvVarNames(): string[] {
  return ['CI','CIRCLECI']
}
