const util = require("util");
const fs = require("fs");
const path = require("path");

const readFile = util.promisify(fs.readFile);

async function getFileListing(filePath) {
  return getAllFiles(filePath).join("");
}

function isBlacklisted(file) {
  // TODO: honor the .gitignore file instead of a hard-coded list
  const blacklist = [
    "node_modules",
    ".git",
    ".nyc_output",
    ".circleci",
    ".nvmrc",
    ".gitignore"
  ];

  return blacklist.includes(file);
}

const getAllFiles = function(dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (
      fs.statSync(dirPath + "/" + file).isDirectory() &&
      !isBlacklisted(file)
    ) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (!isBlacklisted(file)) {
        arrayOfFiles.push(`${path.join(dirPath, "/", file)}\n`);
      }
    }
  });

  return arrayOfFiles;
};

async function readCoverageFile(filePath) {
  baseDir = process.cwd();
  try {
    const fileContents = await readFile(`${baseDir}/${filePath}`);
    return fileContents;
  } catch (error) {
    throw error;
  }
}

function endNetworkMarker() {
  return "<<<<<< network\n";
}

function fileHeader(filePath) {
  return `# path=${filePath}\n`;
}

module.exports = {
  readCoverageFile,
  getFileListing,
  endNetworkMarker,
  fileHeader
};
