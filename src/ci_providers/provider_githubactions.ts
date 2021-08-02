import { IServiceParams, UploaderEnvs, UploaderInputs } from '../types'

import childProcess from 'child_process'
import { info } from '../helpers/logger'

export function detect(envs: UploaderEnvs): boolean {
  return Boolean(envs.GITHUB_ACTIONS)
}

function _getBuild(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  return args.build || envs.GITHUB_RUN_ID || ''
}

function _getBuildURL(inputs: UploaderInputs): string {
  const { envs } = inputs
  return encodeURIComponent(
    `${envs.GITHUB_SERVER_URL}/${_getSlug(inputs)}/actions/runs/${_getBuild(
      inputs,
    )}`,
  )
}

function _getBranch(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  const branchRegex = /refs\/heads\/(.*)/
  const branchMatches = branchRegex.exec(envs.GITHUB_REF || '')
  let branch
  if (branchMatches) {
    branch = branchMatches[1]
  }

  if (envs.GITHUB_HEAD_REF && envs.GITHUB_HEAD_REF !== '') {
    branch = envs.GITHUB_HEAD_REF
  }
  return args.branch || branch || ''
}

function _getJob(envs: UploaderEnvs): string {
  return encodeURIComponent(envs.GITHUB_WORKFLOW || '')
}

function _getPR(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  let match
  if (envs.GITHUB_HEAD_REF && envs.GITHUB_HEAD_REF !== '') {
    const prRegex = /refs\/pull\/([0-9]+)\/merge/
    const matches = prRegex.exec(envs.GITHUB_REF || '')
    if (matches) {
      match = matches[1]
    }
  }
  return args.pr || match || ''
}

function _getService(): string {
  return 'github-actions'
}

export function getServiceName(): string {
  return 'GitHub Actions'
}

function _getSHA(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  const pr = _getPR(inputs)

  let commit = envs.GITHUB_SHA
  if (pr && pr.toLowerCase() !== 'false' && !args.sha) {
    const mergeCommitRegex = /^[a-z0-9]{40} [a-z0-9]{40}$/
    const mergeCommitMessage = childProcess
      .spawnSync('git', ['show', '--no-patch', '--format="%P"'])
      .stdout.toString()
      .trimRight()
    if (mergeCommitRegex.exec(mergeCommitMessage)) {
      const mergeCommit = mergeCommitMessage.split(' ')[1]
      info(`    Fixing merge commit SHA ${commit} -> ${mergeCommit}`)
      commit = mergeCommit
    } else if (mergeCommitMessage === '') {
      info(
        '->  Issue detecting commit SHA. Please run actions/checkout with fetch-depth > 1 or set to 0',
      )
    }
  }

  return args.sha || commit || ''
}

function _getSlug(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  return args.slug || envs.GITHUB_REPOSITORY || ''
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
  return [
    'GITHUB_ACTION',
    'GITHUB_HEAD_REF',
    'GITHUB_REF',
    'GITHUB_REPOSITORY',
    'GITHUB_RUN_ID',
    'GITHUB_SERVER_URL',
    'GITHUB_SHA',
    'GITHUB_WORKFLOW',
  ]
}
