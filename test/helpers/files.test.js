const fs = require("fs");
const path = require("path");
const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const fileHelpers = require("../../src/helpers/files");

describe("File Helpers", () => {
  it("can generate network end marker", () => {
    expect(fileHelpers.endNetworkMarker()).to.equal("<<<<<< network\n");
  });
  it("can generate report file header", () => {
    expect(fileHelpers.fileHeader("test-coverage-file.xml")).to.equal(
      "# path=test-coverage-file.xml\n"
    );
  });
  it("can read a coverage report file", async () => {
    sinon
      .stub(fs, "readFileSync")
      .withArgs("./test-coverage-file.xml")
      .returns("I am test coverage data");
    const reportContents = fileHelpers.readCoverageFile(
      ".",
      "test-coverage-file.xml"
    );
    expect(reportContents).to.equal("I am test coverage data");
  });
});
