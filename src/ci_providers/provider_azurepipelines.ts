import childProcess from 'child_process'
import { parseSlugFromRemoteAddr } from '../helpers/git'
import { info } from '../helpers/logger'
import { IServiceParams, UploaderEnvs, UploaderInputs } from '../types'

export function detect(envs: UploaderEnvs): boolean {
  return Boolean(envs.SYSTEM_TEAMFOUNDATIONSERVERURI)
}

function _getBuild(inputs: UploaderInputs): string {
  const { args, environment: envs } = inputs
  return args.build || envs.BUILD_BUILDNUMBER || ''
}

function _getBuildURL(inputs: UploaderInputs): string {
  const { environment: envs } = inputs
  if (envs.SYSTEM_TEAMPROJECT && envs.BUILD_BUILDID) {
    return (
      `${envs.SYSTEM_TEAMFOUNDATIONSERVERURI}${envs.SYSTEM_TEAMPROJECT}/_build/results?buildId=${envs.BUILD_BUILDID}`
    )
  }
  return ''
}

function _getBranch(inputs: UploaderInputs): string {
  const { args, environment: envs } = inputs
  let branch = ''
  if (envs.BUILD_SOURCEBRANCH) {
    branch = envs.BUILD_SOURCEBRANCH.toString().replace('refs/heads/', '')
  }
  return args.branch || branch
}

function _getJob(envs: UploaderEnvs): string {
  return envs.BUILD_BUILDID || ''
}

function _getPR(inputs: UploaderInputs): string {
  const { args, environment: envs } = inputs
  return (
    args.pr ||
    envs.SYSTEM_PULLREQUEST_PULLREQUESTNUMBER ||
    envs.SYSTEM_PULLREQUEST_PULLREQUESTID ||
    ''
  )
}

function _getService(): string {
  return 'azure_pipelines'
}

export function getServiceName(): string {
  return 'Azure Pipelines'
}

function _getSHA(inputs: UploaderInputs): string {
  const { args, environment: envs } = inputs
  let commit = envs.BUILD_SOURCEVERSION || ''

  if (_getPR(inputs)) {
    const mergeCommitRegex = /^[a-z0-9]{40} [a-z0-9]{40}$/
    const mergeCommitMessage = childProcess
      .execFileSync('git', ['show', '--no-patch', '--format=%P'])
      .toString()
      .trimRight()
    if (mergeCommitRegex.exec(mergeCommitMessage)) {
      const mergeCommit = mergeCommitMessage.split(' ')[1]
      info(`    Fixing merge commit SHA ${commit} -> ${mergeCommit}`)
      commit = mergeCommit || ''
    }
  }

  return args.sha || commit || ''
}

function _getProject(inputs: UploaderInputs): string {
  const { environment: envs } = inputs
  return envs.SYSTEM_TEAMPROJECT || ''
}

function _getServerURI(inputs: UploaderInputs): string {
  const { environment: envs } = inputs
  return envs.SYSTEM_TEAMFOUNDATIONSERVERURI || ''
}

function _getSlug(inputs: UploaderInputs): string {
  const { args, environment: envs } = inputs
  if (args.slug !== '') return args.slug
  return envs.BUILD_REPOSITORY_NAME || parseSlugFromRemoteAddr('') || ''
}
/**
 * Generates and return the serviceParams object
 *
 * @param {args: {}, envs: {}} inputs an object of arguments and enviromental variable key/value pairs
 * @returns {{ branch: string, build: string, buildURL: string, commit: string, job: string, pr: string, service: string, slug: string }}
 */
export function getServiceParams(inputs: UploaderInputs): IServiceParams {
  return {
    branch: _getBranch(inputs),
    build: _getBuild(inputs),
    buildURL: _getBuildURL(inputs),
    commit: _getSHA(inputs),
    job: _getJob(inputs.environment),
    pr: _getPR(inputs),
    project: _getProject(inputs),
    server_uri: _getServerURI(inputs),
    service: _getService(),
    slug: _getSlug(inputs),
  }
}

export function getEnvVarNames(): string[] {
  return [
    'BUILD_BUILDID',
    'BUILD_BUILDNUMBER',
    'BUILD_SOURCEBRANCH',
    'BUILD_SOURCEVERSION',
    'SYSTEM_PULLREQUEST_PULLREQUESTID',
    'SYSTEM_PULLREQUEST_PULLREQUESTNUMBER',
    'SYSTEM_TEAMFOUNDATIONSERVERURI',
    'SYSTEM_TEAMPROJECT',
  ]
}
