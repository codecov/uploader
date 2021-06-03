const providerCircleci = require('./provider_circleci')
const providerGitHubactions = require('./provider_githubactions')
const providerJenkinsci = require('./provider_jenkinsci')
const providerLocal = require('./provider_local')
const providerTravisci = require('./provider_travisci')

// Please make sure provider_local is last
const providers = [
  providerCircleci,
  providerGitHubactions,
  providerJenkinsci,
  providerTravisci,
  providerLocal,
]

module.exports = providers
