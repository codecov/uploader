const provider_circleci = require("./provider_circleci");
const provider_local = require("./provider_local");

// Please make sure provider_local is last
const providers = [provider_circleci, provider_local];

module.exports = providers;
