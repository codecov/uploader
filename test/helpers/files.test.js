const td = require('testdouble')
const child_process = td.replace("child_process");
const cwd = td.replace(process,'cwd')
const fs = td.replace("fs");
const path = require("path");
const chai = require("chai");

const expect = chai.expect;

const fileHelpers = require("../../src/helpers/files");

describe("File Helpers", function()  {

  beforeEach(function() {
    td.when(child_process.spawnSync("git", ["rev-parse", "--show-toplevel"])).thenReturn({ stdout: "gitRoot" })


  })
  
  afterEach(function () {
    td.reset()
  })


  it("can generate network end marker", function() {
    expect(fileHelpers.endNetworkMarker()).to.equal("<<<<<< network\n");
  });

  it("can get a file listing", async function()  {
    td.when(fs.readdirSync(".")).thenReturn(['npm-shrinkwrap.json'])
    td.when(fs.statSync('./npm-shrinkwrap.json')).thenReturn({isDirectory: function() {return false}})
    expect(await fileHelpers.getFileListing(".")).to.contain(
      "npm-shrinkwrap.json"
    );
  });

  it("can fetch the git root", function()  {


    td.when(cwd()).thenReturn("baa")
    expect(fileHelpers.fetchGitRoot()).to.equal("gitRoot")
  })

  describe("Coverage report handling", function()  {
    it("can generate report file header", function()  {
      expect(fileHelpers.fileHeader("test-coverage-file.xml")).to.equal(
        "# path=test-coverage-file.xml\n"
      );
    });
    it("can read a coverage report file", async function()  {
      td.when(fs.readFileSync("./test-coverage-file.xml")).thenReturn("I am test coverage data")
      const reportContents = fileHelpers.readCoverageFile(
        ".",
        "test-coverage-file.xml"
      );
      expect(reportContents).to.equal("I am test coverage data");
    });
    it("can return a list of coverage files", function() {
      // td.when(child_process.spawnSync("git", ["rev-parse", "--show-toplevel"])).thenReturn({ stdout: "foo" })

      td.when(cwd()).thenReturn("baa")
      td.when(fs.readdirSync(process.cwd())).thenReturn([])
      // td.when(fs.readdirSync(`${process.cwd()}/test/index.test.js"`)).thenReturn([])
      expect(
        fileHelpers.getCoverageFiles(".", ["index.test.js"])
      ).to.deep.equal(["test/index.test.js", "test/providers/index.test.js"]);
    });
    describe("coverage file patterns", () => {
      it("conatins `jacoco*.xml`", () => {
        expect(fileHelpers.coverageFilePatterns()).to.contain("jacoco*.xml");
      });
    });
  });
});
