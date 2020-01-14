const app = require("../src");
const chai = require("chai");
const expect = chai.expect;
const { version } = require("../package.json");

describe("Uploader Core", () => {
  it("Can return version", () => {
    expect(app.getVersion()).to.equal(version);
  });
});
