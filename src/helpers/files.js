const child_process = require("child_process");
const fs = require("fs");
const path = require("path");
const glob = require("glob");

async function getFileListing(projectRoot) {
  return getAllFiles(projectRoot, projectRoot).join("");
}

function manualBlacklist() {
  // TODO: honor the .gitignore file instead of a hard-coded list
  return [
    "node_modules",
    ".git",
    ".nyc_output",
    ".circleci",
    ".nvmrc",
    ".gitignore"
  ];
}

function globBlacklist() {
  // TODO: honor the .gitignore file instead of a hard-coded list
  return [
    "node_modules/**/*",
    ".git",
    ".nyc_output",
    ".circleci",
    ".nvmrc",
    ".gitignore"
  ];
}

function coverageFilePatterns() {
  return [
    "*coverage*.*",
    "nosetests.xml",
    "jacoco*.xml",
    "clover.xml",
    "report.xml",
    "*.codecov.*",
    "codecov.*",
    "cobertura.xml",
    "excoveralls.json",
    "luacov.report.out",
    "coverage-final.json",
    "naxsi.info",
    "lcov.info",
    "lcov.dat",
    "*.lcov",
    "*.clover",
    "cover.out",
    "gcov.info",
    "*.gcov",
    "*.lst"
  ];
}

function getCoverageFiles(projectRoot, coverageFilePatterns) {
  let files = [];
  for (let index = 0; index < coverageFilePatterns.length; index++) {
    const pattern = coverageFilePatterns[index];
    const newFiles = glob.sync(`**/${pattern}`, {
      cwd: projectRoot,
      ignore: globBlacklist()
    });

    files = files.concat(newFiles);
  }
  return files;
}

function isBlacklisted(projectRoot, file, manualBlacklist) {
  // const blacklist = manualBlacklist.concat(parseGitIgnore(projectRoot));
  const blacklist = manualBlacklist;
  return blacklist.includes(file);
}

function fetchGitRoot() {
  try {
    return (
      child_process.spawnSync("git", ["rev-parse", "--show-toplevel"])
        .stdout.toString()
        .trimRight() ||
        child_process.spawnSync("hg", ["root"])
        .stdout.toString()
        .trimRight() ||
      process.cwd()
    );
  } catch (error) {
    throw new Error("Error fetching git root. Please try using the -R flag.");
  }
}

function parseGitIgnore(projectRoot) {
  const gitIgnorePath = path.join(projectRoot, ".gitignore");
  let lines;
  try {
    lines = readAllLines(gitIgnorePath) || [];
  } catch (error) {
    throw new Error(`Unable to open ${gitIgnorePath}: ${error}`);
  }

  const filteredLines = lines.filter(line => {
    if (line === "" || line.startsWith("#")) {
      return false;
    }
    return true;
  });
  return filteredLines;
}

function getAllFiles(projectRoot, dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (
      fs.statSync(dirPath + "/" + file).isDirectory() &&
      !isBlacklisted(projectRoot, file, manualBlacklist())
    ) {
      arrayOfFiles = getAllFiles(
        projectRoot,
        dirPath + "/" + file,
        arrayOfFiles
      );
    } else {
      if (!isBlacklisted(projectRoot, file, manualBlacklist())) {
        arrayOfFiles.push(
          `${path.join(dirPath.replace(projectRoot, "."), "/", file)}\n`
        );
      }
    }
  });

  return arrayOfFiles;
}

function readAllLines(filePath) {
  const fileContents = fs.readFileSync(filePath);

  const lines = fileContents.toString().split("\n") || [];
  return lines;
}

function readCoverageFile(projectRoot, filePath) {
  try {
    const fileContents = fs.readFileSync(`${projectRoot}/${filePath}`);
    return fileContents;
  } catch (error) {
    throw new Error(`There was an error reading the coverage file: ${error}`);
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
  fetchGitRoot,
  parseGitIgnore,
  getCoverageFiles,
  coverageFilePatterns
};
