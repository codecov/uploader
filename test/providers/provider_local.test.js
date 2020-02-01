const provider = require("../../src/ci_providers/provider_local");

const chai = require("chai");
const expect = chai.expect;

const inputs = {args: [], envs: []}

describe("Provider - Local", () => {
  describe("parse slug", () => {
    it("can parse an http url", () => {
      expect(provider.parseSlug("https://testOrg/testRepo")).to.equal(
        "testOrg/testRepo"
      );
    });
    it("can parse a git url", () => {
      expect(provider.parseSlug("git@github.com:testOrg/testRepo")).to.equal(
        "testOrg/testRepo"
      );
    });
    it("will throw when passed neither", () => {
      expect(() => {
        provider.parseSlug("not.a.true.url", inputs);
      }).to.throw(Error, "Unable to parse slug URL: not.a.true.url");
    });
  });
});
