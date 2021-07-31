function detect(envs) {
  return envs.WERCKER_MAIN_PIPELINE_STARTED
}

function _getBuild(inputs) {
  const { args, envs } = inputs
  return args.build || envs.WERCKER_MAIN_PIPELINE_STARTED
}

function _getBuildURL(inputs) {
  const { envs } = inputs
  return envs.WERCKER_BUILD_URL || ''
}

function _getBranch(inputs) {
  const { args, envs } = inputs

  return args.branch || envs.WERCKER_GIT_BRANCH
}

// eslint-disable-next-line no-unused-vars
function _getJob(envs) {
  return ''
}

function _getPR(inputs) {
  const { args } = inputs
  return args.pr || ''
}

function _getService() {
  return 'wercker'
}

function getServiceName() {
  return 'Wercker CI'
}

function _getSHA(inputs) {
  const { args, envs } = inputs
  return args.sha || envs.WERCKER_GIT_COMMIT
}

function _getSlug(inputs) {
  const { args, envs } = inputs
  return args.slug || `${envs.WERCKER_GIT_OWNER}/${envs.WERCKER_GIT_REPOSITORY}`
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
    'WERCKER_BUILD_URL',
    'WERCKER_GIT_BRANCH',
    'WERCKER_GIT_COMMIT',
    'WERCKER_GIT_OWNER',
    'WERCKER_GIT_REPOSITORY',
    'WERCKER_MAIN_PIPELINE_STARTED',
  ]
}

module.exports = {
  detect,
  getEnvVarNames,
  getServiceName,
  getServiceParams,
}
