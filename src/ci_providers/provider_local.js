const childprocess = require('child_process')
const { parseSlug } = require('../helpers/git')
const { logAndThrow } = require('../helpers/util')

function detect(envs) {
  return !envs.CI
}

function _getBuild(inputs) {
  const { args } = inputs
  return args.build || ''
}

// eslint-disable-next-line no-unused-vars
function _getBuildURL(inputs) {
  return ''
}

function _getBranch(inputs) {
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
    logAndThrow(`There was an error getting the branch name from git: ${error}`)
  }
}

// eslint-disable-next-line no-unused-vars
function _getJob(envs) {
  return ''
}

// eslint-disable-next-line no-unused-vars
function _getPR(inputs) {
  const { args } = inputs
  return args.pr || ''
}

// This is the value that gets passed to the Codecov uploader
function _getService() {
  return ''
}

// This is the name that gets printed
function getServiceName() {
  return 'Local'
}

function _getSHA(inputs) {
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
    logAndThrow(`There was an error getting the commit SHA from git: ${error}`)
  }
}

function _getSlug(inputs) {
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
    logAndThrow(`There was an error getting the slug from git: ${error}`)
  }
}

function getServiceParams(inputs) {
  return {
    branch: _getBranch(inputs),
    build: _getBuild(inputs),
    buildURL: _getBuildURL(inputs),
    commit: _getSHA(inputs),
    job: _getJob(inputs),
    pr: _getPR(inputs),
    service: _getService(),
    slug: _getSlug(inputs),
  }
}

function getEnvVarNames() {
  return ['CI']
}

module.exports = {
  detect,
  getEnvVarNames,
  getServiceName,
  getServiceParams,
}
