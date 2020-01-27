const validate = require("../../src/helpers/validate");

const chai = require("chai");
const expect = chai.expect;

describe("Input Validators", () => {
  describe("Tokens", () => {
    it("Returns true with a valid token", () => {
      expect(validate.validateToken("1bc123")).to.be.true;
    });
    it("Returns false with an invalid token", () => {
      expect(validate.validateToken("1bc1 23")).to.be.false;
    });
  });

  describe("Flags", () => {
    it("Should fail with a dash", () => {
      expect(validate.validateFlags("moo-foor")).to.be.false;
    });
  });

  describe("URLs", () => {
    it("Returns true with a valid URL", () => {
      expect(validate.validateURL("https://codecov.io")).to.be.true;
    });
    it("Returns false with an invalid URL", () => {
      expect(validate.validateURL("not.a.URL.com")).to.be.false;
    });
    it("Returns false with an empty URL", () => {
      expect(validate.validateURL("")).to.be.false;
    });
  });
});
