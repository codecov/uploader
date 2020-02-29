const validate = require("../../src/helpers/validate");

const chai = require("chai");
const expect = chai.expect;

describe("Input Validators", function() {
  describe("Tokens", function() {
    it("Returns true with a valid token", function() {
      expect(validate.validateToken("1bc123")).to.be.true;
    });
    it("Returns false with an invalid token", function() {
      expect(validate.validateToken("1bc1 23")).to.be.false;
    });
  });

  describe("Flags", function() {
    it("Should fail with a dash", function() {
      expect(validate.validateFlags("moo-foor")).to.be.false;
    });
  });

  describe("URLs", function() {
    it("Returns true with a valid URL", function() {
      expect(validate.validateURL("https://codecov.io")).to.be.true;
    });
    it("Returns false with an invalid URL", function() {
      expect(validate.validateURL("not.a.URL.com")).to.be.false;
    });
    it("Returns false with an empty URL", function() {
      expect(validate.validateURL("")).to.be.false;
    });
  });
});
