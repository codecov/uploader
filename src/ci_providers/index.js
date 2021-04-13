const providerCircleci = require('./provider_circleci')
const providerLocal = require('./provider_local')

// Please make sure provider_local is last
const providers = [providerCircleci, providerLocal]

module.exports = providers
