const { spawnSync } = require("child_process");
const processHelper = require("../helpers/process")

function detect(envs) {
  return !envs.CI;
}

function getServiceName() {
  return "Local";
}

function getBranch(inputs) {
  const { args } = inputs
  try {
    const branchName = spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"])
      .stdout.toString()
      .trimRight();
    return args.branch || branchName;
  } catch (error) {
    console.error("There was an error getting the branch name from git: ", error)
    processHelper.exitNonZeroIfSet(inputs)
  }
}

function getSHA(inputs) {
  const { args} = inputs
  try {
    const sha = spawnSync("git", ["rev-parse", "HEAD"])
      .stdout.toString()
      .trimRight();
    return args.sha || sha;
  } catch (error) {
    console.error("There was an error getting the commit SHA from git: ", error)
    processHelper.exitNonZeroIfSet(inputs)
  }
}

function parseSlug(slug, inputs) {
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
  console.error("Unable to parse slug URL: " + slug);
  processHelper.exitNonZeroIfSet(inputs)
}

function getSlug(inputs) {
  const {args} = inputs
  try {
    const slug = spawnSync("git", ["config", "--get", "remote.origin.url"])
      .stdout.toString()
      .trimRight();
    return args.slug || parseSlug(slug, inputs);
  } catch (error) {
    console.error("There was an error getting the slug from git: ", error)
    processHelper.exitNonZeroIfSet(inputs)
  }
}

function getServiceParams(inputs) {
  return {
    branch: getBranch(inputs),
    commit: getSHA(inputs),
    build: "",
    buildURL: "",
    slug: inputs.args.slug || getSlug(inputs),
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
