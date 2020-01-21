const { spawnSync } = require("child_process");

function detect() {
  return !process.env.CI;
}

function getBranch() {
  try {
    branchName = spawnSync("git", [
      "rev-parse",
      "--abbrev-ref",
      "HEAD"
    ]).stdout.toString();
    return branchName;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  detect,
  getBranch
};
