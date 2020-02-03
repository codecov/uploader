const child_process = require("child_process");
const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");

const providers = require("../../src/ci_providers");

describe("CI Providers", () => {
  it("is an array of CI providers", () => expect(providers).to.be.an("array"));

  const SpawnSyncStub = sinon
    .stub(child_process, "spawnSync")
    .withArgs("git", ["config", "--get", "remote.origin.url"])
    .returns({ stdout: "git@github.com:testOrg/testRepo.git" })
    .withArgs("git", ["rev-parse", "--abbrev-ref", "HEAD"])
    .returns({ stdout: "testingBranch" })
    .withArgs("git", ["rev-parse", "HEAD"])
    .returns({ stdout: "testingSHA" });

  providers.forEach(provider => {
    const inputs = {
      args: {},
      envs: {
        CIRCLE_PROJECT_USERNAME: "testOrg",
        CIRCLE_PROJECT_REPONAME: "testRepo",
        CIRCLE_SHA1: "testingSHA"
      }
    };
    describe(`${provider.getServiceName() || ""}`, () => {
      it("has a detect() method", () => {
        expect(provider.detect).is.an("function");
      });
      it("has a getServiceName() method", () => {
        expect(provider.getServiceName).is.an("function");
      });
      it("has a getServiceParams() method", () => {
        expect(provider.getServiceParams).is.an("function");
      });
      describe("getServiceParams", () => {
        const serviceParams = provider.getServiceParams(inputs);
        it("has it's commit property set", () => {
          expect(serviceParams.commit).to.equal("testingSHA");
        });
      });
      it("has a getSlug() method", () => {
        expect(provider.getSlug).is.an("function");
      });
      describe("getSlug()", () => {
        it("can get the slug from a git url", () => {
          SpawnSyncStub.returns({
            stdout: "git@github.com:testOrg/testRepo.git"
          });
          expect(provider.getSlug(inputs)).to.equal("testOrg/testRepo");
        });
        it("can get the slug from an https url", () => {
          SpawnSyncStub.returns({
            stdout: "https://github.com/testOrg/testRepo.git"
          });
          expect(provider.getSlug(inputs)).to.equal("testOrg/testRepo");
        });
      });
    });
  });
});
