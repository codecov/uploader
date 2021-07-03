const providerAppveyorci = require('./provider_appveyorci')
const providerAzurepipelines = require('./provider_azurepipelines')
const providerCircleci = require('./provider_circleci')
const providerGitHubactions = require('./provider_githubactions')
const providerGitLabci = require('./provider_gitlabci')
const providerJenkinsci = require('./provider_jenkinsci')
const providerLocal = require('./provider_local')
const providerTravisci = require('./provider_travisci')

// Please make sure provider_local is last
const providers = [
  providerAppveyorci,
  providerAzurepipelines,
  providerCircleci,
  providerGitHubactions,
  providerGitLabci,
  providerJenkinsci,
  providerTravisci,
  providerLocal,
]

module.exports = providers
