const { version } = require("../package.json");
const validate = require("./helpers/validate");
var figlet = require("figlet");

function generateQuery(
  branch,
  commit,
  build,
  build_url,
  name,
  tag,
  slug,
  service,
  flags,
  pr,
  job
) {
  query = "".concat(
    "branch=",
    branch,
    "&commit=",
    commit,
    "&build=",
    build,
    "&build_url=",
    build_url,
    "&name=",
    name,
    "&tag=",
    tag,
    "& slug=",
    slug,
    "&service=",
    service,
    "&flags=",
    flags,
    "&pr=",
    pr,
    "&job=",
    job
  );
  return query;
}

function dryRun(uploadHost, token, query, uploadFile) {
  console.log(`==> Dumping upload file (no upload)`);
  console.log(
    `${up / uploadHost}/v4?package=uploader-${version}&token=${token}&${query}`
  );
  console.log(upload_file);
  process.exit();
}

function main(args) {
  uploadHost = validate.validateURL(args.url) ? args.url : "https://codecov.io";
  token = validate.validateToken(args.token)
    ? args.token
    : console.log(uploadHost);
  console.log(generateHeader(getVersion()));
  // console.dir(env);
  console.dir(args);

  if (args.dryRun) {
    dryRun(uploadHost, token, query, uploadFile);
  }
}

function generateHeader(version) {
  header = `
     _____          _
    / ____|        | |
   | |     ___   __| | ___  ___ _____   __
   | |    / _ \\ / _\` |/ _ \\/ __/ _ \\ \\ / /
   | |___| (_) | (_| |  __/ (_| (_) \\ V /
    \\_____\\___/ \\__,_|\\___|\\___\\___/ \\_/

  Codecov report uploader ${version}`;
  return header;
}

function getVersion() {
  return version;
}

module.exports = {
  main,
  getVersion,
  generateQuery,
  displayHeader: generateHeader
};
