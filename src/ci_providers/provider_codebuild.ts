import { IServiceParams, UploaderInputs } from "../types"

export function detect(envs: NodeJS.ProcessEnv) {
  return !!envs.CODEBUILD_CI
}

function _getBuild(inputs: UploaderInputs) {
  const { args, envs } = inputs
  return args.build || envs.CODEBUILD_BUILD_ID || ''
}

// eslint-disable-next-line no-unused-vars
function _getBuildURL(inputs: UploaderInputs) {
  return ''
}

function _getBranch(inputs: UploaderInputs) {
  const { args, envs } = inputs
  return (
    args.branch ||
    (envs.CODEBUILD_WEBHOOK_HEAD_REF
      ? envs.CODEBUILD_WEBHOOK_HEAD_REF.replace(/^refs\/heads\//, '')
      : '')
  )
}

function _getJob(envs: NodeJS.ProcessEnv) {
  return envs.CODEBUILD_BUILD_ID || ''
}

function _getPR(inputs: UploaderInputs) {
  const { args, envs } = inputs
  return (
    args.pr ||
    (envs.CODEBUILD_SOURCE_VERSION &&
    envs.CODEBUILD_SOURCE_VERSION.startsWith('pr/')
      ? envs.CODEBUILD_SOURCE_VERSION.replace(/^pr\//, '')
      : '')
  )
}

function _getService() {
  return 'codebuild'
}

export function getServiceName() {
  return 'AWS CodeBuild'
}

function _getSHA(inputs: UploaderInputs) {
  const { args, envs } = inputs
  return args.sha || envs.CODEBUILD_RESOLVED_SOURCE_VERSION || ''
}

function _getSlug(inputs: UploaderInputs) {
  const { args, envs } = inputs
  return (
    args.slug ||
    (envs.CODEBUILD_SOURCE_REPO_URL
      ? envs.CODEBUILD_SOURCE_REPO_URL.replace(/^.*github.com\//, '').replace(
          /\.git$/,
          '',
        )
      : '')
  )
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
