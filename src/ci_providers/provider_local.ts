import childprocess from 'child_process'
import { parseSlug } from '../helpers/git'
import { IServiceParams, UploaderEnvs, UploaderInputs } from '../types'

// This provider requires git to be installed
export function detect(envs: UploaderEnvs): boolean {
  return !childprocess
  .spawnSync('git').error
}

function _getBuild(inputs: UploaderInputs): string {
  const { args } = inputs
  return args.build || ''
}

// eslint-disable-next-line no-unused-vars
function _getBuildURL(inputs: UploaderInputs): string {
  return ''
}

function _getBranch(inputs: UploaderInputs): string {
  const { args } = inputs
  if (args.branch) {
    return args.branch
  }
  try {
    const branchName = childprocess
      .spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'])
      .stdout.toString()
      .trimRight()
    return branchName
  } catch (error) {
    throw new Error(
      `There was an error getting the branch name from git: ${error}`,
    )
  }
}

// eslint-disable-next-line no-unused-vars
function _getJob(env: UploaderEnvs): string {
  return ''
}

// eslint-disable-next-line no-unused-vars
function _getPR(inputs: UploaderInputs): number {
  const { args } = inputs
  return Number(args.pr || '')
}

// This is the value that gets passed to the Codecov uploader
function _getService(): string {
  return ''
}

// This is the name that gets printed
export function getServiceName(): string {
  return 'Local'
}

function _getSHA(inputs: UploaderInputs) {
  const { args } = inputs
  if (args.sha) {
    return args.sha
  }
  try {
    const sha = childprocess
      .spawnSync('git', ['rev-parse', 'HEAD'])
      .stdout.toString()
      .trimRight()
    return sha
  } catch (error) {
    throw new Error(`There was an error getting the commit SHA from git: ${error}`)
  }
}

function _getSlug(inputs: UploaderInputs): string {
  const { args } = inputs
  if (args.slug) {
    return args.slug
  }
  try {
    const slug = childprocess
      .spawnSync('git', ['config', '--get', 'remote.origin.url'])
      .stdout.toString()
      .trimRight()
    return parseSlug(slug)
  } catch (error) {
    throw new Error(`There was an error getting the slug from git: ${error}`)
  }
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
  return ['CI']
}
