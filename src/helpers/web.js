const superagent = require("superagent");
const validateHelpers = require("./validate");

function populateBuildParams(inputs, serviceParams) {
  const { args, envs } = inputs;
  serviceParams.name = envs.CODECOV_NAME || "";
  serviceParams.tag = args.tag || "";
  serviceParams.flags = validateHelpers.validateFlags(args.flags)
    ? args.flags
    : "";
  return serviceParams;
}

async function uploadToCodecovPUT(uploadURL, uploadFile) {
  console.log("Uploading...");

  const parts = uploadURL.split("\n");
  const putURL = parts[1];
  const codecovResultURL = parts[0];

  try {
    const result = await superagent
      .put(`${putURL}`)
      .retry()
      .send(uploadFile) // sends a JSON post body
      .set("Content-Type", "application/x-gzip")
      .set("Content-Encoding", "gzip")
      .set("Content-Length", Buffer.byteLength(uploadFile));

    if (result.status === 200) {
      return { status: "success", resultURL: codecovResultURL };
    }
    throw new Error(`Error uploading: ${result.status}, ${result.body}`);
  } catch (error) {
    throw new Error(`Error uploading: ${error}`);
  }
}

async function uploadToCodecov(uploadURL, token, query, uploadFile, version) {
  try {
    const result = await superagent
      .post(
        `${uploadURL}/upload/v4?package=uploader-${version}&token=${token}&${query}`
      )
      .retry()
      .send(uploadFile) // sends a JSON post body
      .set("X-Reduced-Redundancy", "false")
      .set("X-Content-Type", "application/x-gzip")
      .set("Content-Length", Buffer.byteLength(uploadFile));

    return result.res.text;
  } catch (error) {
    throw new Error(`Error uploading to Codecov: ${error}`);
  }
}

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

module.exports = {
  populateBuildParams,
  uploadToCodecov,
  uploadToCodecovPUT,
  generateQuery
};
