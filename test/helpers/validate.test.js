const validate = require("../../src/helpers/validate");

const chai = require("chai");
const expect = chai.expect;

describe("Uploader Helpers", () => {
  it("Can validate token", () => {
    expect(validate.validateToken("1bc123")).to.equal("abc123");
  });
});
