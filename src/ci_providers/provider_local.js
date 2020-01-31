const { spawnSync } = require("child_process");
const processHelper = require("../helpers/process")

function detect(envs) {
  return !envs.CI;
}

function getServiceName() {
  return "Local";
}

function getBranch(envs, args) {
  try {
    const branchName = spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"])
      .stdout.toString()
      .trimRight();
    return args.branch || branchName;
  } catch (error) {
    console.error("There was an error getting the branch name from git: ", error)
    processHelper.exitNonZeroIfSet(envs, args)
  }
}

function getSHA(envs, args) {
  try {
    const sha = spawnSync("git", ["rev-parse", "HEAD"])
      .stdout.toString()
      .trimRight();
    return args.sha || sha;
  } catch (error) {
    console.error("There was an error getting the commit SHA from git: ", error)
    processHelper.exitNonZeroIfSet(envs, args)
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

function getSlug(envs, args) {
  try {
    const slug = spawnSync("git", ["config", "--get", "remote.origin.url"])
      .stdout.toString()
      .trimRight();
    return args.slug || parseSlug(slug);
  } catch (error) {
    console.error("There was an error getting the slug from git: ", error)
    process.exit(-1)
  }
}

function getServiceParams(envs, args) {
  return {
    branch: getBranch(envs, args),
    commit: getSHA(envs, args),
    build: "",
    buildURL: "",
    slug: args.slug || getSlug(envs, args),
    service: "",
    pr: "",
    job: ""
  };
}

module.exports = {
  detect,
  getServiceParams,
  parseSlug,
  getServiceName
};
