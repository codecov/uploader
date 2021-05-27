var execSync = require('child_process').execSync

const { log } = require('./helpers/logger')

function detect (envs) {
  return envs.GITHUB_ACTIONS
}

function _getBuild (inputs) {
  const { args, envs } = inputs
  return args.build || envs.GITHUB_RUN_ID || '';
}

function _getBuildURL (inputs) {
  const { args, envs } = inputs
  return encodeURIComponent(
    `https://github.com/${env.GITHUB_REPOSITORY}/actions/runs/${_getBuild(inputs)}`
  )
}

function _getBranch (inputs) {
  const { args, env } = inputs
  const branchRegex = /refs\/heads\/(.*)/
  let branch = branchRegex.exec(env.GITHUB_REF)

  if (env.GITHUB_HEAD_REF != '') {
    branch = env.GITHUB_HEAD_REF
  }
  return args.branch || branch
}

function _getJob (envs) {
  return encodeURIComponent(envs.GITHUB_WORKFLOW)
}

function _getPR (inputs) {
  const { args, env } = inputs
  if (env.GITHUB_HEAD_REF != '') {
    const prRegex = /refs\/pull\/([0-9]+)\/merge/
    const matches = prRegex.exec(env.GITHUB_REF)
  }
  return args.pr || matches[1] || '';
}

function _getService () {
  return 'github-actions'
}

function getServiceName () {
  return 'GitHub Actions'
}
/**
 * Determine the commit SHA that is being uploaded, based on args or envs
 *
 * @param {args: {}, envs: {}} inputs an object of arguments and enviromental variable key/value pairs
 * @returns String
 */
function _getSHA (inputs) {
  const { args, env } = inputs
  const pr = _getPR(inputs)

  let commit = env.GITHUB_SHA
  if (pr && pr != false && !args.sha) {
    const mergeCommitRegex = /^[a-z0-9]{40}[[:space:]][a-z0-9]{40}$/
    const mergeCommitMessage = execSync(`
      git show --no-patch --format="%P" 2>/dev/null || echo ""
    `)
    if (mergeCommitRegex.exec(mergeCommitMessage)) {
      const mergeCommit = mergeCommitMessage.split(" ")[1]
      log(`    Fixing merge commit SHA ${commit} -> ${mergeCommit}`)
    }
    else if (mergeCommitMessage == "") {
      log(`->  Issue detecting commit SHA. Please run actions/checkout with fetch-depth > 1 or set to 0`)
    }
  }

  return args.sha || commit
}

function _getSlug (inputs) {
  const { args, env } = inputs
  return args.slug || env.GITHUB_REPOSITORY || ''
}

function getServiceParams (inputs) {
  return {
    branch: _getBranch(inputs),
    build: _getBuild(inputs),
    buildURL: _getBuildURL(inputs),
    commit: _getSHA(inputs),
    job: _getJob(inputs),
    pr: _getPR(inputs),
    service: _getService(),
    slug: _getSlug(inputs)
  }
}

module.exports = {
  private: {
    _getBuild,
    _getBuildURL,
    _getBranch,
    _getJob,
    _getPR,
    _getService,
    _getSHA,
    _getSlug
  },
  detect,
  getServiceName,
  getServiceParams
}
