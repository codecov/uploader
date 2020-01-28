const files = require("../../src/helpers/files");

const chai = require("chai");
const expect = chai.expect;

describe("File Helpers", () => {
  it("Can generate network end marker", () => {
    expect(files.endNetworkMarker()).to.equal("<<<<<< network\n");
  });
});
