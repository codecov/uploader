const child_process = require("child_process");
const chai = require("chai");
const expect = chai.expect;

const providers = require("../../src/ci_providers");

describe("CI Providers", () => {
  it("is an array of CI providers", () => expect(providers).to.be.an("array"));
  // const SpawnSyncStub = sinon.stub(child_process, "spawnSync");
  providers.forEach(provider => {
    // SpawnSyncStub.withArgs("git", ["config", "--get", "remote.origin.url"])
    //   .returns({ stdout: "git@github.com:testOrg/testRepo.git" })
    //   .withArgs("git", ["rev-parse", "--abbrev-ref", "HEAD"])
    //   .returns({ stdout: "testingBranch" })
    //   .withArgs("git", ["rev-parse", "HEAD"])
    //   .returns({ stdout: "testingSHA" });
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
      it("has a getService() method", () => {
        expect(provider.private._getService).is.an("function");
      });
      it("has a getServiceName() method", () => {
        expect(provider.getServiceName).is.an("function");
      });
      it("has a getServiceParams() method", () => {
        expect(provider.getServiceParams).is.an("function");
      });
      describe("getServiceParams()", () => {
        const serviceParams = provider.getServiceParams(inputs);
        it("has it's branch property set", () => {
          expect(serviceParams.branch).to.equal(
            provider.private._getBranch(inputs)
          );
        });
        it("has it's build property set", () => {
          expect(serviceParams.build).to.equal(
            provider.private._getBuild(inputs)
          );
        });
        it("has it's buildURL property set", () => {
          expect(serviceParams.buildURL).to.equal(
            provider.private._getBuildURL(inputs)
          );
        });
        it("has it's commit property set", () => {
          expect(serviceParams.commit).to.equal(
            provider.private._getSHA(inputs)
          );
        });
        it("has it's job property set", () => {
          expect(serviceParams.job).to.equal(
            provider.private._getJob(inputs.envs)
          );
        });
        it("has it's pr property set", () => {
          expect(serviceParams.pr).to.equal(provider.private._getPR(inputs));
        });
        it("has it's service property set", () => {
          expect(serviceParams.service).to.equal(
            provider.private._getService(inputs)
          );
        });
        it("has it's slug property set", () => {
          expect(serviceParams.slug).to.equal(
            provider.private._getSlug(inputs)
          );
        });
      });
      it("has a getSlug() method", () => {
        expect(provider.private._getSlug).is.an("function");
      });
      describe("getSlug()", () => {
        it("can get the slug from a git url", () => {
          // SpawnSyncStub.returns({
          //   stdout: "git@github.com:testOrg/testRepo.git"
          // });
          expect(provider.private._getSlug(inputs)).to.equal(
            "testOrg/testRepo"
          );
        });
        it("can get the slug from an http(s) url", () => {
          // SpawnSyncStub.withArgs("git", [
          //   "config",
          //   "--get",
          //   "remote.origin.url"
          // ]).returns({
          //   stdout: "http://github.com/testOrg/testRepo.git"
          // });
          expect(provider.private._getSlug(inputs)).to.equal(
            "testOrg/testRepo"
          );
        });
      });
    });
  });
});
