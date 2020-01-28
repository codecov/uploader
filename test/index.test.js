const app = require("../src");
const chai = require("chai");
const expect = chai.expect;
const { version } = require("../package.json");

describe("Uploader Core", () => {
  it("Can return version", () => {
    expect(app.getVersion()).to.equal(version);
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
    expect(app.generateQuery(queryParams)).to.equal(
      "branch=testBranch&commit=commitSHA&build=4&build_url=https://ci-providor.local/job/xyz&name=testName&tag=tagV1&slug=testOrg/testRepo&service=testingCI&flags=unit,uploader&pr=2&job=6"
    );
  });
  it("Can display header", () => {
    expect(app.generateHeader(app.getVersion())).to.equal(`
     _____          _
    / ____|        | |
   | |     ___   __| | ___  ___ _____   __
   | |    / _ \\ / _\` |/ _ \\/ __/ _ \\ \\ / /
   | |___| (_) | (_| |  __/ (_| (_) \\ V /
    \\_____\\___/ \\__,_|\\___|\\___\\___/ \\_/

  Codecov report uploader 0.1.0`);
  });
});
