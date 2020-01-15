const app = require("../src");
const chai = require("chai");
const expect = chai.expect;
const { version } = require("../package.json");

describe("Uploader Core", () => {
  it("Can return version", () => {
    expect(app.getVersion()).to.equal(version);
  });
  it("Can generate query URL", () => {
    expect(
      app.generateQuery(
        "testBranch",
        "commitSHA",
        "4",
        "https://ci-providor.local/job/xyz",
        "testName",
        "tagV1",
        "testOrg/testRepo",
        "testingCI",
        "unit,uploader",
        "2",
        "6"
      )
    ).to.equal(
      "branch=testBranch&commit=commitSHA&build=4&build_url=https://ci-providor.local/job/xyz&name=testName&tag=tagV1& slug=testOrg/testRepo&service=testingCI&flags=unit,uploader&pr=2&job=6"
    );
  });
});
