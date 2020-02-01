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

const getAllFiles = function(dirPath, arrayOfFiles, origionalPath) {
  // This replacement is needed because the cwd changes when being packaged
  origionalPath = process.cwd();

  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (
      fs.statSync(dirPath + "/" + file).isDirectory() &&
      !isBlacklisted(file)
    ) {
      arrayOfFiles = getAllFiles(
        dirPath + "/" + file,
        arrayOfFiles,
        origionalPath
      );
    } else {
      if (!isBlacklisted(file)) {
        //   arrayOfFiles.push(`${path.join(dirPath, "/", file)}\n`);
        arrayOfFiles.push(
          `${path.join(dirPath.replace(origionalPath, "."), "/", file)}\n`
        );
      }
    }
  });

  return arrayOfFiles;
};

async function readCoverageFile(filePath) {
  const baseDir = process.cwd();
  try {
    const fileContents = await readFile(`${baseDir}/${filePath}`);
    return fileContents;
  } catch (error) {
    console.error("There was an error reading the coverage file: ", error)
    process.exit(-1)
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
