import { IServiceParams, UploaderEnvs, UploaderInputs } from '../types'

export function detect(envs: UploaderEnvs): boolean {
  return !!envs.CODEBUILD_CI
}

function _getBuild(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  return args.build || envs.CODEBUILD_BUILD_ID?.toString() || ''
}

// eslint-disable-next-line no-unused-vars
function _getBuildURL(inputs: UploaderInputs): string {
  return ''
}

function _getBranch(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  return (
    args.branch ||
    (envs.CODEBUILD_WEBHOOK_HEAD_REF
      ? envs.CODEBUILD_WEBHOOK_HEAD_REF.toString().replace(/^refs\/heads\//, '')
      : '')
  )
}

function _getJob(envs: UploaderEnvs): string {
  return envs.CODEBUILD_BUILD_ID?.toString() || ''
}

function _getPR(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  return (
    args.pr ||
    (envs.CODEBUILD_SOURCE_VERSION &&
    envs.CODEBUILD_SOURCE_VERSION.toString().startsWith('pr/')
      ? envs.CODEBUILD_SOURCE_VERSION.toString().replace(/^pr\//, '')
      : '')
  )
}

function _getService(): string {
  return 'codebuild'
}

export function getServiceName() : string{
  return 'AWS CodeBuild'
}

function _getSHA(inputs: UploaderInputs) : string{
  const { args, envs } = inputs
  return args.sha || envs.CODEBUILD_RESOLVED_SOURCE_VERSION?.toString() || ''
}

function _getSlug(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  return (
    args.slug ||
    (envs.CODEBUILD_SOURCE_REPO_URL
      ? envs.CODEBUILD_SOURCE_REPO_URL.toString().replace(/^.*github.com\//, '').replace(
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
