const td = require("testdouble")
const fs = require("fs");
const path = require("path");
const child_process = require("child_process")
const process = require("process")
const fileHelpers = require("../../src/helpers/files");

describe("File Helpers", () => {

  afterEach(function() {
    td.reset()
  })


  it("can generate network end marker", () => {
    expect(fileHelpers.endNetworkMarker()).toBe("<<<<<< network\n");
  });

  it("can fetch the git root", function() {
    const cwd = td.replace(process, 'cwd')
    const spawnSync = td.replace(child_process, 'spawnSync')
    td.when(cwd()).thenReturn({stdout: "fish"})
    td.when(spawnSync("git", ["rev-parse", "--show-toplevel"])).thenReturn({stdout: "gitRoot"})
    
    expect(fileHelpers.fetchGitRoot()).toBe("gitRoot")
  })

  it("can get a file listing", async () => {
    expect(await fileHelpers.getFileListing(".")).toMatch(
      "npm-shrinkwrap.json"
    );
  });

  it("can parse the .gitignore file", function() {
    const readFileSync = td.replace(fs, 'readFileSync')
    td.when(readFileSync(".gitignore")).thenReturn("ignore this file\nandthisone\n# not me!\n\nand me")
    expect(fileHelpers.parseGitIgnore('.')).toStrictEqual(["ignore this file", "andthisone", "and me"])
  })

  describe("Coverage report handling", () => {
    it("can generate report file header", () => {
      expect(fileHelpers.fileHeader("test-coverage-file.xml")).toBe(
        "# path=test-coverage-file.xml\n"
      );
    });
    it("can read a coverage report file", async () => {
      const readFileSync = td.replace(fs, 'readFileSync')
      td.when(readFileSync("./test-coverage-file.xml")).thenReturn("I am test coverage data")
      const reportContents = fileHelpers.readCoverageFile(
        ".",
        "test-coverage-file.xml"
      );
      expect(reportContents).toBe("I am test coverage data");
    });
    it("can return a list of coverage files", () => {
      expect(
        fileHelpers.getCoverageFiles(".", ["index.test.js"])
      ).toStrictEqual(["test/index.test.js", "test/providers/index.test.js"]);
    });
    describe("coverage file patterns", function() {
      it("conatins `jacoco*.xml`", function() {
        expect(fileHelpers.coverageFilePatterns()).toContain("jacoco*.xml");
      });
    });
  });
});
