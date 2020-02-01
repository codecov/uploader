const { spawnSync } = require("child_process");
const util = require("util");
const fs = require("fs");
const path = require("path");

const readFile = util.promisify(fs.readFile);

async function getFileListing(projectRoot) {
  return getAllFiles(projectRoot, projectRoot).join("");
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

function fetchGitRoot() {
  return (
    spawnSync("git", ["rev-parse", "--show-toplevel"])
      .stdout.toString()
      .trimRight() ||
    spawnSync("hg", ["root"])
      .stdout.toString()
      .trimRight() ||
    process.cwd()
  );
}

const getAllFiles = function(projectRoot, dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  console.log(projectRoot, dirPath, files);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (
      fs.statSync(dirPath + "/" + file).isDirectory() &&
      !isBlacklisted(file) &&
      file != ""
    ) {
      arrayOfFiles = getAllFiles(
        projectRoot,
        dirPath + "/" + file,
        arrayOfFiles
      );
    } else {
      if (!isBlacklisted(file)) {
        arrayOfFiles.push(
          `${path.join(dirPath.replace(projectRoot, "."), "/", file)}\n`
        );
      }
    }
  });

  return arrayOfFiles;
};

async function readCoverageFile(projectRoot, filePath) {
  try {
    const fileContents = await readFile(`${projectRoot}/${filePath}`);
    return fileContents;
  } catch (error) {
    console.error("There was an error reading the coverage file: ", error);
    process.exit(-1);
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
  fileHeader,
  fetchGitRoot
};
