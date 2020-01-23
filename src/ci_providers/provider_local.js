const { spawnSync } = require("child_process");

function detect(envs) {
  return !envs.CI;
}

function getBranch(envs, args) {
  try {
    branchName = spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"])
      .stdout.toString()
      .trimRight();
    return args.branch || branchName;
  } catch (error) {
    throw error;
  }
}

function getSHA(envs, args) {
  try {
    sha = spawnSync("git", ["rev-parse", "HEAD"])
      .stdout.toString()
      .trimRight();
    return args.sha || sha;
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

function getSlug(envs, args) {
  try {
    slug = spawnSync("git", ["config", "--get", "remote.origin.url"])
      .stdout.toString()
      .trimRight();
    return args.slug || parseSlug(slug);
  } catch (error) {
    throw error;
  }
}

function getServiceParams(envs, args) {
  return {
    branch: getBranch(envs, args),
    commit: getSHA(envs, args),
    build: "",
    buildURL: "",
    name: "",
    tag: "",
    slug: args.slug || getSlug(envs, args),
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
