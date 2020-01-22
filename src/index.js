const https = require("https");
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

  let serviceParams;
  for (const provider of providers) {
    if (provider.detect()) {
      serviceParams = provider.getServiceParams(args);
      break;
    }
  }

  console.log(serviceParams);

  if (serviceParams === undefined) {
    console.error("Unable to detect service, please specify manually.");
    process.exit(-1);
  }

  query = generateQuery(
    generateQueryParams(
      serviceParams.branch,
      serviceParams.commit,
      serviceParams.slug
    )
  );

  uploadFile = endNetworkMarker();

  if (args.dryRun) {
    dryRun(uploadHost, token, query, uploadFile);
  } else {
    uploadToCodecov(uploadHost, token, query, uploadFile);
  }
}

function parseURLToHostAndPost(url) {
  if (url.match("https://")) {
    return { port: 443, host: url.split("//")[1] };
  } else if (url.match("http://")) {
    return { port: 80, host: url.split("//")[1] };
  }
  throw new Error("Unable to parse upload url.");
}

function uploadToCodecov(uploadURL, token, query, uploadFile) {
  // ${uploadHost}/v4?package=uploader-${version}&token=${token}&${query}
  hostAndPort = parseURLToHostAndPost(uploadURL);
  const options = {
    hostname: hostAndPort.host,
    port: hostAndPort.port,
    path: `/v4?package=uploader-${version}&token=${token}&${query}`,
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(uploadFile)
    }
  };

  const req = https.request(options, res => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding("utf8");
    res.on("data", chunk => {
      console.log(`BODY: ${chunk}`);
    });
    res.on("end", () => {
      console.log("No more data in response.");
    });
  });

  req.on("error", e => {
    console.error(`problem with request: ${e.message}`);
  });

  // Write data to request body
  req.write(uploadFile);
  req.end();
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
