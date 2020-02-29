const td = require('testdouble')
const child_process = td.replace("child_process");
const chai = require("chai");
const expect = chai.expect;

const providers = require("../../src/ci_providers");



describe("CI Providers", function() {

  


  it("is an array of CI providers", function() {expect(providers).to.be.an("array")});
  
  providers.forEach(function(provider) {

    // let SpawnSyncStub

    let inputs

    let serviceParams
  
    beforeEach(function()  {
      td.reset()
      td.when(child_process.spawnSync("git", ["config", "--get", "remote.origin.url"])).thenReturn({ stdout: "git@github.com:testOrg/testRepo.git" })
      td.when(child_process.spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"])).thenReturn({ stdout: "testingBranch" })
      td.when(child_process.spawnSync("git", ["rev-parse", "HEAD"])).thenReturn({ stdout: "testingSha" })


      // SpawnSyncStub = sinon.stub(child_process, "spawnSync");
  
      // SpawnSyncStub.withArgs("git", ["config", "--get", "remote.origin.url"])
      // .returns({ stdout: "git@github.com:testOrg/testRepo.git" })
      // .withArgs("git", ["rev-parse", "--abbrev-ref", "HEAD"])
      // .returns({ stdout: "testingBranch" })
      // .withArgs("git", ["rev-parse", "HEAD"])
      // .returns({ stdout: "testingSHA" });
  
      inputs = {
        args: {},
        envs: {
          CIRCLE_PROJECT_USERNAME: "testOrg",
          CIRCLE_PROJECT_REPONAME: "testRepo",
          CIRCLE_SHA1: "testingSHA"
        }
      };
      serviceParams = provider.getServiceParams(inputs);
  
    })

    afterEach(function () {
      td.reset()
    })

    describe(`${provider.getServiceName() || ""}`, function()  {
      it("has a detect() method", function()  {
        expect(provider.detect).is.an("function");
      });
      it("has a getService() method", function()  {
        expect(provider.private._getService).is.an("function");
      });
      it("has a getServiceName() method", function()  {
        expect(provider.getServiceName).is.an("function");
      });
      it("has a getServiceParams() method", function()  {
        expect(provider.getServiceParams).is.an("function");
      });
      describe("getServiceParams()", function()  {




        
        it("has it's branch property set", function()  {
          expect(serviceParams.branch).to.equal(
            provider.private._getBranch(inputs)
          );
        });
        it("has it's build property set", function()  {
          expect(serviceParams.build).to.equal(
            provider.private._getBuild(inputs)
          );
        });
        it("has it's buildURL property set", function()  {
          expect(serviceParams.buildURL).to.equal(
            provider.private._getBuildURL(inputs)
          );
        });
        it("has it's commit property set", function()  {
          expect(serviceParams.commit).to.equal(
            provider.private._getSHA(inputs)
          );
        });
        it("has it's job property set", function()  {
          expect(serviceParams.job).to.equal(
            provider.private._getJob(inputs.envs)
          );
        });
        it("has it's pr property set", function()  {
          expect(serviceParams.pr).to.equal(provider.private._getPR(inputs));
        });
        it("has it's service property set", function()  {
          expect(serviceParams.service).to.equal(
            provider.private._getService(inputs)
          );
        });
        it("has it's slug property set", function()  {
          expect(serviceParams.slug).to.equal(
            provider.private._getSlug(inputs)
          );
        });
      });
      it("has a getSlug() method", function()  {
        expect(provider.private._getSlug).is.an("function");
      });
      describe("getSlug()", function()  {
        it("can get the slug from a git url", function()  {
          td.when(child_process.spawnSync("git", ["config", "--get", "remote.origin.url"])).thenReturn({ stdout: "git@github.com:testOrg/testRepo.git" })
          expect(provider.private._getSlug(inputs)).to.equal(
            "testOrg/testRepo"
          );
        });
        it("can get the slug from an http(s) url", function()  {
          td.when(child_process.spawnSync("git", ["config", "--get", "remote.origin.url"])).thenReturn({ stdout: "http://github.com/testOrg/testRepo.git" })


          expect(provider.private._getSlug(inputs)).to.equal(
            "testOrg/testRepo"
          );
        });
      });
    });
  });
});
