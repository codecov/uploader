const util = require("util");
const fs = require("fs");

const readFile = util.promisify(fs.readFile);

async function readCoverageFile(filePath) {
  baseDir = process.cwd();
  try {
    const fileContents = await readFile(`${baseDir}/${filePath}`);
    return fileContents;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  readCoverageFile
};
