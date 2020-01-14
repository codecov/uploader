const validate = require("../../src/helpers/validate");

const chai = require("chai");
const expect = chai.expect;

describe("Input Validators", () => {
  describe("Tokens", () => {
    it("Return true with valid token", () => {
      expect(validate.validateToken("1bc123")).to.be.true;
    });
    it("Return false with invalid token", () => {
      expect(validate.validateToken("1bc1 23")).to.be.false;
    });
  });
});
