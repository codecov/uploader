const superagent = require("superagent");
const processHelper = require("./process")
const validateHelpers = require("./validate")

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
    serviceParams.flags = validateHelpers.validateFlags(args.flags) ? args.flags : "";
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
  
  async function uploadToCodecov(uploadURL, token, query, uploadFile, inputs, version) {
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
  }
  