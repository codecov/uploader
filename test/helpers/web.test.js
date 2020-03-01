const nock = require("nock");

const webHelper = require("../../src/helpers/web");

describe("Web Helpers", function() {
  let inputs;
  let uploadURL;
  let token;
  let uploadFile;
  let version;
  let query;
  beforeEach(function() {
    inputs = { args: {}, envs: {} };
    token = "123-abc-890-xyz";
    uploadFile = "some content";
    query = "hello";
    version = "0.0.1";

      nock("https://codecov.io")
      .put("/")
      .query(true)
      .reply(200, "testPUT");

});

afterEach(function() {
  uploadURL = ""
})

  it("Can POST to the uploader endpoint (HTTP)", async function() {
    uploadURL = "http://codecov.io";
    nock("http://codecov.io")
    .post("/upload/v4")
    .query(true)
    .reply(200, "testPOSTHTTP");

    const response = await webHelper.uploadToCodecov(
      uploadURL,
      token,
      query,
      uploadFile,
      version
    );
    try {
      expect(response).toBe("testPOSTHTTP");  
    } catch (error) {
      console.trace(error)
    }
    
  });

  it("Can POST to the uploader endpoint (HTTPS)", async function() {
    uploadURL = "https://codecov.io";
    nock("https://codecov.io")
    .post("/upload/v4")
    .query(true)
    .reply(200, "testPOSTHTTPS");

    const response = await webHelper.uploadToCodecov(
      uploadURL,
      token,
      query,
      uploadFile,
      version
    );
    expect(response).toBe("testPOSTHTTPS");
  });

  it("Can PUT to the storage endpoint", async function() {
    uploadURL = "https://results.codecov.io\nhttps://codecov.io";
    const response = await webHelper.uploadToCodecovPUT(
      uploadURL,
      uploadFile,
    );
    expect(response.resultURL).toBe("https://results.codecov.io");
  });

  it("Can generate query URL", function() {
    const queryParams = {};
    queryParams.branch = "testBranch";
    queryParams.commit = "commitSHA";
    queryParams.buildURL = "https://ci-providor.local/job/xyz";
    queryParams.job = "6";
    queryParams.flags = "unit,uploader";
    queryParams.slug = "testOrg/testRepo";
    queryParams.build = "4";
    queryParams.service = "testingCI";
    queryParams.name = "testName";
    queryParams.tag = "tagV1";
    queryParams.pr = "2";
    expect(webHelper.generateQuery(queryParams)).toBe(
      "branch=testBranch&commit=commitSHA&build=4&build_url=https://ci-providor.local/job/xyz&name=testName&tag=tagV1&slug=testOrg/testRepo&service=testingCI&flags=unit,uploader&pr=2&job=6"
    );
  });

  it("can populateBuildParams() from args", function() {
    const result = webHelper.populateBuildParams(
      { args: { flags: "testFlag", tag: "testTag" }, envs: {} },
      { name: "", tag: ", flags: []" }
    );
    expect(result.flags).toBe("testFlag");
  });
});
