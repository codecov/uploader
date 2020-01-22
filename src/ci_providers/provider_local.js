const { spawnSync } = require("child_process");

function detect() {
  return !process.env.CI;
}

function getBranch() {
  try {
    branchName = spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"])
      .stdout.toString()
      .trimRight();
    return branchName;
  } catch (error) {
    throw error;
  }
}

function getSHA() {
  try {
    sha = spawnSync("git", ["rev-parse", "HEAD"])
      .stdout.toString()
      .trimRight();
    return sha;
  } catch (error) {
    throw error;
  }
}

function parseSlug(slug) {
  // origin    https://github.com/torvalds/linux.git (fetch)

  // git@github.com: codecov / uploader.git

  if (slug.match("http")) {
    // Type is http(s)
    let cleanSlug = slug.split("//")[1].replace(".git", "");
    return cleanSlug;
  } else if (slug.match("@")) {
    // Type is git
    let cleanSlug = slug.split(":")[1].replace(".git", "");
    return cleanSlug;
  }
  throw new Error("Unable to parse slug URL: " + slug);
}

function getSlug() {
  try {
    slug = spawnSync("git", ["config", "--get", "remote.origin.url"])
      .stdout.toString()
      .trimRight();
    return parseSlug(slug);
  } catch (error) {
    throw error;
  }
}

function getServiceParams(args) {
  return {
    branch: getBranch(),
    commit: getSHA(),
    build: "",
    buildURL: "",
    name: "",
    tag: "",
    slug: getSlug() || args.slug || "",
    service: "",
    flags: "",
    pr: "",
    job: ""
  };
}

module.exports = {
  detect,
  getServiceParams,
  parseSlug
};
