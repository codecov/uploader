const { version } = require("../package.json");
const validate = require("./helpers/validate");
const providers = require("./ci_providers");

function generateQueryParams(branch, commit, slug) {
  if (branch === undefined || commit === undefined || slug === undefined) {
    throw new Error("branch, commit, and slug are all required paramitars");
  }
  this.branch = branch;
  this.commit = commit;
  this.slug = slug;
  return {
    branch,
    commit,
    build: "",
    buildURL: "",
    name: "",
    tag: "",
    slug,
    service: "",
    flags: "",
    pr: "",
    job: ""
  };
}

function generateQuery(queryParams) {
  query = "".concat(
    "branch=",
    queryParams.branch,
    "&commit=",
    queryParams.commit,
    "&build=",
    queryParams.build,
    "&build_url=",
    queryParams.buildURL,
    "&name=",
    queryParams.name,
    "&tag=",
    queryParams.tag,
    "&slug=",
    queryParams.slug,
    "&service=",
    queryParams.service,
    "&flags=",
    queryParams.flags,
    "&pr=",
    queryParams.pr,
    "&job=",
    queryParams.job
  );
  return query;
}

function dryRun(uploadHost, token, query, uploadFile) {
  console.log(`==> Dumping upload file (no upload)`);
  console.log(
    `${uploadHost}/v4?package=uploader-${version}&token=${token}&${query}`
  );
  console.log(uploadFile);
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

  console.log(providers.local.detect());
  console.log(providers.local.getBranch());

  query = generateQuery(generateQueryParams());

  uploadFile = endNetworkMarker();

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

function endNetworkMarker() {
  return "<<<<<< network\n";
}

module.exports = {
  main,
  getVersion,
  generateQuery,
  generateHeader,
  endNetworkMarker,
  generateQueryParams
};
