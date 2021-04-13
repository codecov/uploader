const providerCircleci = require('./provider_circleci')
const providerLocal = require('./provider_local')

// Please make sure providerLocal is last
const providers = [providerCircleci, providerLocal]

module.exports = providers
