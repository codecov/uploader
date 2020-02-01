const zlib = require("zlib");
const superagent = require("superagent");
const { version } = require("../package.json");
const files = require("./helpers/files");
const validate = require("./helpers/validate");
const processHelper = require("./helpers/process");
const providers = require("./ci_providers");

function generateQuery(queryParams) {
  const query = "".concat(
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
    `${uploadHost}/upload/v4?package=uploader-${version}&token=${token}&${query}`
  );
  console.log(uploadFile);
  process.exit();
}

async function main(args) {
  // TODO: clean and sanitize envs and args
  const envs = process.env;
  // args
  const inputs = { args, envs}

  const uploadHost = validate.validateURL(args.url) ? args.url : "https://codecov.io";
  let token = validate.validateToken(args.token) ? args.token : "";
  console.log(generateHeader(getVersion()));

  // Look for files
  if (!args.file) {
    console.error("Not yet able to scan for files, please use `-f");
    processHelper.exitNonZeroIfSet(inputs)
  }

  const uploadFilePath = validate.validateFileNamePath(args.file) ? args.file : "";
  if (uploadFilePath === "") {
    console.error("Not coverage file found, exiting.")
    processHelper.exitNonZeroIfSet(inputs)
  }

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
    processHelper.exitNonZeroIfSet(inputs)
  }

  const query = generateQuery(populateBuildParams(inputs, serviceParams));

  // Geneerate file listing
  let uploadFile = await files.getFileListing(process.cwd());
  uploadFile = `${uploadFile}${files.endNetworkMarker()}`;

  // Get coverage report contents
  uploadFile = `${uploadFile}${files.fileHeader(args.file)}`;
  const fileContents = await files.readCoverageFile(uploadFilePath);

  uploadFile = `${uploadFile}${fileContents}`;

  token = args.token || process.env.CODECOV_TOKEN || "";
  const gzippedFile = zlib.gzipSync(uploadFile);

  if (args.dryRun) {
    dryRun(uploadHost, token, query, uploadFile);
  } else {
    const uploadURL = await uploadToCodecov(
      uploadHost,
      token,
      query,
      gzippedFile,
      envs, 
      args
    );
    const result = await uploadToCodecovPUT(uploadURL, gzippedFile, inputs);
    console.log(result);
  }
}

function parseURLToHostAndPost(url, inputs) {
  if (url.match("https://")) {
    return { port: 443, host: url.split("//")[1] };
  } else if (url.match("http://")) {
    return { port: 80, host: url.split("//")[1] };
  }
  console.error("Unable to parse upload url.");
  processHelper.exitNonZeroIfSet(inputs)
}

function populateBuildParams(inputs, serviceParams) {
  const { args, envs } = inputs
  serviceParams.name = envs.CODECOV_NAME || "";
  serviceParams.tag = args.tag || "";
  serviceParams.flags = validate.validateFlags(args.flags) ? args.flags : "";
  return serviceParams;
}

async function uploadToCodecovPUT(uploadURL, uploadFile, inputs) {
  console.log("Uploading...");

  const parts = uploadURL.split("\n");
  const putURL = parts[1];
  const codecovResultURL = parts[0];

  try {
    const result = await superagent
      .put(`${putURL}`)
      .send(uploadFile) // sends a JSON post body
      .set("Content-Type", "application/x-gzip")
      .set("Content-Encoding", "gzip")
      .set("x-amz-acl", "public-read")
      .set("Content-Length", Buffer.byteLength(uploadFile));

    if (result.status === 200) {
      return { status: "success", resultURL: codecovResultURL };
    }
    console("Error uploading");
  } catch (error) {
    console.error(error);
    processHelper.exitNonZeroIfSet(inputs)
  }
}

async function uploadToCodecov(uploadURL, token, query, uploadFile, inputs) {
  const hostAndPort = parseURLToHostAndPost(uploadURL, inputs);
  console.log(
    `Pinging Codecov: ${hostAndPort.host}/v4?package=uploader-${version}&token=*******&${query}`
  );

  try {
    const result = await superagent
      .post(
        `${hostAndPort.host}/upload/v4?package=uploader-${version}&token=${token}&${query}`
      )
      .send(uploadFile) // sends a JSON post body
      .set("X-Reduced-Redundancy", "false")
      .set("X-Content-Type", "application/x-gzip")
      .set("Content-Length", Buffer.byteLength(uploadFile));

    return result.res.text;
  } catch (error) {
    console.error(error);
    processHelper.exitNonZeroIfSet(inputs)
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
  generateQuery,
  generateHeader
};
