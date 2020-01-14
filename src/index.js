const { version } = require("../package.json");

function main(env, args) {
  console.log(`Codecov report uploader ${getVersion()}`);
}

function getVersion() {
  return version;
}

url = "https://codecov.io";

flag = "--dry-run";

module.exports = {
  main,
  getVersion
};
