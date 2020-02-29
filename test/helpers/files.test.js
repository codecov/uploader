const fs = require("fs");
const path = require("path");
const chai = require("chai");
const expect = chai.expect;
const fileHelpers = require("../../src/helpers/files");

describe("File Helpers", () => {
  it("can generate network end marker", () => {
    expect(fileHelpers.endNetworkMarker()).to.equal("<<<<<< network\n");
  });

  it("can get a file listing", async () => {
    expect(await fileHelpers.getFileListing(".")).to.contain(
      "npm-shrinkwrap.json"
    );
  });

  describe("Coverage report handling", () => {
    it("can generate report file header", () => {
      expect(fileHelpers.fileHeader("test-coverage-file.xml")).to.equal(
        "# path=test-coverage-file.xml\n"
      );
    });
    it("can read a coverage report file", async () => {
      // sinon
      //   .stub(fs, "readFileSync")
      //   .withArgs("./test-coverage-file.xml")
      //   .returns("I am test coverage data");
      const reportContents = fileHelpers.readCoverageFile(
        ".",
        "test-coverage-file.xml"
      );
      expect(reportContents).to.equal("I am test coverage data");
    });
    it("can return a list of coverage files", () => {
      expect(
        fileHelpers.getCoverageFiles(".", ["index.test.js"])
      ).to.deep.equal(["test/index.test.js", "test/providers/index.test.js"]);
    });
    describe("coverage file patterns", function() {
      it("conatins `jacoco*.xml`", function() {
        expect(fileHelpers.coverageFilePatterns()).to.contain("jacoco*.xml");
      });
    });
  });
});
