const nock = require("nock");
const chai = require("chai");
const expect = chai.expect;
const should = chai.should();

const webHelper = require("../../src/helpers/web");

describe("Web Helpers", () => {
  let inputs;
  let uploadURL;
  let token;
  let uploadFile;
  let version;
  let query;
  beforeEach(() => {
    inputs = { args: {}, envs: {} };
    token = "123-abc-890-xyz";
    uploadFile = "some content";
    query = "hello";
    version = "0.0.1";

    // const hostAndPort = webHelper.parseURLToHostAndPost(uploadURL, inputs);

    // console.dir(hostAndPort);

    nock("https://codecov.io")
      .post("/upload/v4")
      .query(true)
      .reply(200, "test");

    nock("http://codecov.io")
      .post("/upload/v4")
      .query(true)
      .reply(200, "test");
  });

  it("Throws an exception when parseURLToHostAndPost() is passed a non web  URI", () => {
    expect(() => {
      webHelper.parseURLToHostAndPost("git://foo@bar.git");
    }).to.Throw();
  });

  it("Can POST to the uploader endpoint (HTTP)", async () => {
    uploadURL = "http://codecov.io";
    const response = await webHelper.uploadToCodecov(
      uploadURL,
      token,
      query,
      uploadFile,
      version
    );
    expect(response).to.be.equal("test");
  });

  it("Can POST to the uploader endpoint (HTTPS)", async () => {
    uploadURL = "https://codecov.io";
    const response = await webHelper.uploadToCodecov(
      uploadURL,
      token,
      query,
      uploadFile,
      version
    );
    expect(response).to.be.equal("test");
  });

  it("Can generate query URL", () => {
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
    expect(webHelper.generateQuery(queryParams)).to.equal(
      "branch=testBranch&commit=commitSHA&build=4&build_url=https://ci-providor.local/job/xyz&name=testName&tag=tagV1&slug=testOrg/testRepo&service=testingCI&flags=unit,uploader&pr=2&job=6"
    );
  });
});
