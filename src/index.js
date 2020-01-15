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
  displayHeader();
  // console.dir(env);
  console.dir(args);

  if (args.dryRun) {
    dryRun(uploadHost, token, query, uploadFile);
  }
}

function displayHeader(params) {
  figlet("Codecov", function(err, data) {
    if (err) {
      throw new Error("Something went wrong...", err);
    }
    console.log(data);
    console.log(`Codecov report uploader ${getVersion()}`);
  });
}

function getVersion() {
  return version;
}

flag = "--dry-run";

module.exports = {
  main,
  getVersion,
  generateQuery,
  displayHeader
};
