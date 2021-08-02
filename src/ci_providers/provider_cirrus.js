function detect(envs) {
  return !!envs.CIRRUS_CI
}

function _getBuild(inputs) {
  const { args, envs } = inputs
  return args.build || envs.CIRRUS_BUILD_ID
}

// eslint-disable-next-line no-unused-vars
function _getBuildURL(inputs) {
  return ''
}

function _getBranch(inputs) {
  const { args, envs } = inputs
  return args.branch || envs.CIRRUS_BRANCH
}

function _getJob(envs) {
  return envs.CIRRUS_TASK_ID || ''
}

function _getPR(inputs) {
  const { args, envs } = inputs
  return args.pr || envs.CIRRUS_PR
}

function _getService() {
  return 'cirrus-ci'
}

function getServiceName() {
  return 'Cirrus CI'
}

function _getSHA(inputs) {
  const { args, envs } = inputs
  return args.sha || envs.CIRRUS_CHANGE_IN_REPO
}

function _getSlug(inputs) {
  const { args, envs } = inputs
  return args.slug || envs.CIRRUS_REPO_FULL_NAME
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

function getEnvVarNames() {
  return [
    'CIRRUS_BRANCH',
    'CIRRUS_BUILD_ID',
    'CIRRUS_CHANGE_IN_REPO',
    'CIRRUS_CI',
    'CIRRUS_PR',
    'CIRRUS_REPO_FULL_NAME',
    'CIRRUS_TASK_ID',
  ]
}

module.exports = {
  detect,
  getEnvVarNames,
  getServiceName,
  getServiceParams,
}
