const { parseSlugFromRemoteAddr } = require('../helpers/git')

function detect(envs) {
  return !!envs.TEAMCITY_VERSION
}

// eslint-disable-next-line no-unused-vars
function _getBuildURL(inputs) {
  return ''
}

// This is the value that gets passed to the Codecov uploader
function _getService() {
  return 'teamcity'
}

// This is the name that gets printed
function getServiceName() {
  return 'TeamCity'
}

function _getBranch(inputs) {
  const { args, envs } = inputs
  return args.branch || envs.BRANCH_NAME
}

function _getSHA(inputs) {
  const { args, envs } = inputs
  return args.sha || envs.BUILD_VCS_NUMBER
}

function _getSlug(inputs) {
  const { args } = inputs
  return args.slug || parseSlugFromRemoteAddr('') || ''
}

function _getBuild(inputs) {
  const { args, envs } = inputs
  return args.build || envs.BUILD_NUMBER || ''
}

function _getPR(inputs) {
  const { args } = inputs
  return args.pr || ''
}

// eslint-disable-next-line no-unused-vars
function _getJob(envs) {
  return ''
}

function getServiceParams(inputs) {
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

module.exports = {
  detect,
  getServiceName,
  getServiceParams,
}
