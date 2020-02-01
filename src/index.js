const zlib = require("zlib");
const { version } = require("../package.json");
const fileHelpers = require("./helpers/files");
const validateHelpers = require("./helpers/validate");
const processHelpers = require("./helpers/process");
const webHelpers = require("./helpers/web");
const providers = require("./ci_providers");

function dryRun(uploadHost, token, query, uploadFile) {
  console.log(`==> Dumping upload file (no upload)`);
  console.log(
    `${uploadHost}/upload/v4?package=uploader-${version}&token=${token}&${query}`
  );
  console.log(uploadFile);
  process.exit();
}

async function main(args) {
  /*
  Step 1: validate and sanitize inputs
  Step 2: detect if we are in a git repo
  Step 3: get network (file listing)
  Step 4: select coverage files (search or specify)
  Step 5: generate upload file
  Step 6: determine CI provider
  Step 7: either upload or dry-run
  */

  // == Step 1: validate and sanitize inputs
  // TODO: clean and sanitize envs and args
  const envs = process.env;
  // args
  const inputs = { args, envs };

  const uploadHost = validateHelpers.validateURL(args.url)
    ? args.url
    : "https://codecov.io";
  let token = validateHelpers.validateToken(args.token) ? args.token : "";
  if (token === "") {
    token = process.env.CODECOV_TOKEN || "";
  }
  token = args.token || process.env.CODECOV_TOKEN || "";
  console.log(generateHeader(getVersion()));

  // == Step 2: detect if we are in a git repo
  const gitRoot = args.rootDir || fileHelpers.fetchGitRoot();
  if (gitRoot === "") {
    console.log(
      "=> No git repo detected. Please use the -R flag if the below detected directory is not correct."
    );
  }

  console.log("=> Project root located at: ", gitRoot);

  // == Step 3: get network
  const fileListing = await fileHelpers.getFileListing(gitRoot);

  // == Step 4: select coverage files (search or specify)

  // Look for files
  if (!args.file) {
    console.error("Not yet able to scan for files, please use `-f");
    processHelpers.exitNonZeroIfSet(inputs);
  }

  const uploadFilePath = validateHelpers.validateFileNamePath(args.file)
    ? args.file
    : "";
  if (uploadFilePath === "") {
    console.error("Not coverage file found, exiting.");
    processHelpers.exitNonZeroIfSet(inputs);
  }

  // == Step 5: generate upload file
  // TODO: capture envs
  let uploadFile = fileListing;

  uploadFile = uploadFile.concat(fileHelpers.endNetworkMarker());

  // Get coverage report contents
  uploadFile = uploadFile.concat(fileHelpers.fileHeader(args.file));
  const fileContents = await fileHelpers.readCoverageFile(".", uploadFilePath);

  uploadFile = uploadFile.concat(fileContents);
  const gzippedFile = zlib.gzipSync(uploadFile);

  // == Step 6: determine CI provider

  // Determine CI provider
  let serviceParams;
  for (const provider of providers) {
    if (provider.detect(envs)) {
      console.log(`Detected ${provider.getServiceName()} as the CI provider.`);
      serviceParams = provider.getServiceParams(inputs);
      break;
    }
  }

  if (serviceParams === undefined) {
    console.error("Unable to detect service, please specify manually.");
    processHelpers.exitNonZeroIfSet(inputs);
  }

  // == Step 7: either upload or dry-run

  const query = webHelpers.generateQuery(
    webHelpers.populateBuildParams(inputs, serviceParams)
  );

  if (args.dryRun) {
    dryRun(uploadHost, token, query, uploadFile);
  } else {
    const uploadURL = await webHelpers.uploadToCodecov(
      uploadHost,
      token,
      query,
      gzippedFile,
      inputs,
      version
    );
    const result = await webHelpers.uploadToCodecovPUT(
      uploadURL,
      gzippedFile,
      inputs
    );
    console.log(result);
  }
}

function generateHeader(version) {
  return `
     _____          _
    / ____|        | |
   | |     ___   __| | ___  ___ _____   __
   | |    / _ \\ / _\` |/ _ \\/ __/ _ \\ \\ / /
   | |___| (_) | (_| |  __/ (_| (_) \\ V /
    \\_____\\___/ \\__,_|\\___|\\___\\___/ \\_/

  Codecov report uploader ${version}`;
}

function getVersion() {
  return version;
}

module.exports = {
  main,
  getVersion,
  generateHeader
};
