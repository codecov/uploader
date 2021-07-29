import childProcess from 'child_process'
import { info } from '../helpers/logger'
import { IServiceParams, UploaderEnvs, UploaderInputs } from '../types'

export function detect(envs: UploaderEnvs): boolean {
  return Boolean(envs.SYSTEM_TEAMFOUNDATIONSERVERURI)
}

function _getBuild(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  return args.build || envs.BUILD_BUILDNUMBER?.toString() || ''
}

function _getBuildURL(inputs: UploaderInputs): string {
  const { envs } = inputs
  if (envs.SYSTEM_TEAMPROJECT && envs.BUILD_BUILDID) {
    return encodeURIComponent(
      `${envs.SYSTEM_TEAMFOUNDATIONSERVERURI}${envs.SYSTEM_TEAMPROJECT}/_build/results?buildId=${envs.BUILD_BUILDID}`,
    )
  }
  return ''
}

function _getBranch(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  let branch = ''
  if (envs.BUILD_SOURCEBRANCH) {
    branch = envs.BUILD_SOURCEBRANCH.toString().replace('refs/heads/', '')
  }
  return args.branch || branch
}

function _getJob(envs: UploaderEnvs): string {
  return envs.BUILD_BUILDID?.toString() || ''
}

function _getPR(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  return (
    args.pr ||
    envs.SYSTEM_PULLREQUEST_PULLREQUESTNUMBER?.toString() ||
    envs.SYSTEM_PULLREQUEST_PULLREQUESTID?.toString() ||
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
  const { args, envs } = inputs
  let commit = envs.BUILD_SOURCEVERSION?.toString() || ''

  if (_getPR(inputs)) {
    const mergeCommitRegex = /^[a-z0-9]{40} [a-z0-9]{40}$/
    const mergeCommitMessage = childProcess
      .execFileSync('git', ['show', '--no-patch', '--format="%P"'])
      .toString()
      .trimRight()
    if (mergeCommitRegex.exec(mergeCommitMessage)) {
      const mergeCommit = mergeCommitMessage.split(' ')[1]
      info(`    Fixing merge commit SHA ${commit} -> ${mergeCommit}`)
      commit = mergeCommit
    }
  }

  return args.sha || commit || ''
}

function _getProject(inputs: UploaderInputs): string {
  const { envs } = inputs
  return envs.SYSTEM_TEAMPROJECT?.toString() || ''
}

function _getServerURI(inputs: UploaderInputs): string {
  const { envs } = inputs
  return envs.SYSTEM_TEAMFOUNDATIONSERVERURI?.toString() || ''
}

function _getSlug(inputs: UploaderInputs): string {
  const { args } = inputs
  return args.slug || ''
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
    job: _getJob(inputs.envs),
    pr: _getPR(inputs),
    project: _getProject(inputs),
    server_uri: _getServerURI(inputs),
    service: _getService(),
    slug: _getSlug(inputs),
  }
}
