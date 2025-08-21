/**
 * https://docs.semaphoreci.com/ci-cd-environment/environment-variables/
 */
import { IServiceParams, UploaderEnvs, UploaderInputs } from '../types'

/**
 * Detects if this CI provider is being used
 *
 * @param {*} envs an object of environment variable key/value pairs
 * @returns boolean
 */

export function detect(envs: UploaderEnvs): boolean {
  return Boolean(envs.CI) && Boolean(envs.SEMAPHORE)
}

/**
 * Determine the build number, based on args and envs
 *
 * @param {args: {}, envs: {}} inputs an object of arguments and environment variable key/value pairs
 * @returns {string}
 */
function _getBuild(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  return args.build || envs.SEMAPHORE_WORKFLOW_NUMBER || ''
}

/**
 * Determine the build URL for use in the Codecov UI
 *
 * @param {args: {}, envs: {}} inputs an object of arguments and environment variable key/value pairs
 * @returns {string}
 */
function _getBuildURL(inputs: UploaderInputs): string {
  const { envs } = inputs
  if (envs.SEMAPHORE_ORGANIZATION_URL && envs.SEMAPHORE_WORKFLOW_ID) {
    return `${envs.SEMAPHORE_ORGANIZATION_URL}/workflows/${envs.SEMAPHORE_WORKFLOW_ID}`
  }
  return ''
}

/**
 * Determine the branch of the repository, based on args and envs
 *
 * @param {args: {}, envs: {}} inputs an object of arguments and environment variable key/value pairs
 * @returns {string}
 */
function _getBranch(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  return args.branch || envs.SEMAPHORE_GIT_PR_BRANCH || envs.SEMAPHORE_GIT_BRANCH || ''
}

/**
 * Determine the job number, based on args or envs
 *
 * @param {*} envs an object of environment variable key/value pairs
 * @returns {string}
 */
function _getJob(envs: UploaderEnvs): string {
  return envs.SEMAPHORE_WORKFLOW_ID || ''
}

/**
 * Determine the PR number, based on args and envs
 *
 * @param {args: {}, envs: {}} inputs an object of arguments and environment variable key/value pairs
 * @returns {string}
 */
function _getPR(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  return args.pr || envs.SEMAPHORE_GIT_PR_NUMBER || ''
}

/**
 * The CI service name that gets sent to the Codecov uploader as part of the query string
 *
 * @returns {string}
 */
function _getService(): string {
  return 'semaphore'
}

/**
 * The CI Service name that gets displayed when running the uploader
 *
 * @returns
 */
export function getServiceName(): string {
  return 'Semaphore CI'
}
/**
 * Determine the commit SHA that is being uploaded, based on args or envs
 *
 * @param {args: {}, envs: {}} inputs an object of arguments and environment variable key/value pairs
 * @returns {string}
 */
function _getSHA(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  try {
    // when running on a PR, SEMAPHORE_GIT_SHA is the PR's merge commit
    return args.sha || envs.SEMAPHORE_GIT_PR_SHA || envs.SEMAPHORE_GIT_SHA || ''
  } catch (error) {
    throw new Error(
      `There was an error getting the commit SHA from git: ${error}`,
    )
  }
}
/**
 * Determine the slug (org/repo) based on  args or envs
 *
 * @param {args: {}, envs: {}} inputs an object of arguments and environment variable key/value pairs
 * @returns {string}
 */
function _getSlug(inputs: UploaderInputs): string {
  const { args, envs } = inputs
  try {
    return args.slug || envs.SEMAPHORE_GIT_PR_SLUG || envs.SEMAPHORE_GIT_REPO_SLUG || ''
  } catch (error) {
    throw new Error(`There was an error getting the slug from git: ${error}`)
  }
}
/**
 * Generates and return the serviceParams object
 *
 * @param {args: {}, envs: {}} inputs an object of arguments and environment variable key/value pairs
 * @returns {{ branch: string, build: string, buildURL: string, commit: string, job: string, pr: string, service: string, slug: string }}
 */
export async function getServiceParams(inputs: UploaderInputs): Promise<IServiceParams> {
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

/**
 * Returns all the environment variables used by the provider
 *
 * @returns [{string}]
 */
export function getEnvVarNames(): string[] {
  return [
    'CI',
    'SEMAPHORE',
    'SEMAPHORE_WORKFLOW_NUMBER',
    'SEMAPHORE_ORGANIZATION_URL',
    'SEMAPHORE_WORKFLOW_ID',
    'SEMAPHORE_GIT_PR_BRANCH',
    'SEMAPHORE_GIT_BRANCH',
    'SEMAPHORE_GIT_PR_NUMBER',
  ]
}
