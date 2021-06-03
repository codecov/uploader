const providerCircleci = require('./provider_circleci')
const providerGitHubactions = require('./provider_githubactions')
const providerLocal = require('./provider_local')

// Please make sure provider_local is last
const providers = [
  providerCircleci,
  providerGitHubactions,
  providerLocal
]

module.exports = providers
