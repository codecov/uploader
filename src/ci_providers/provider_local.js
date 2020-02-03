const child_process = require("child_process");

function detect(envs) {
  return !envs.CI;
}

function getServiceName() {
  return "Local";
}

function getBranch(inputs) {
  const { args } = inputs;
  try {
    const branchName = child_process
      .spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"])
      .stdout.toString()
      .trimRight();
    return args.branch || branchName;
  } catch (error) {
    throw new Error(
      "There was an error getting the branch name from git: ",
      error
    );
  }
}

function getSHA(inputs) {
  const { args } = inputs;
  try {
    const sha = child_process
      .spawnSync("git", ["rev-parse", "HEAD"])
      .stdout.toString()
      .trimRight();
    return args.sha || sha;
  } catch (error) {
    throw new Error(
      "There was an error getting the commit SHA from git: ",
      error
    );
  }
}

function parseSlug(slug) {
  // origin    https://github.com/torvalds/linux.git (fetch)

  // git@github.com: codecov / uploader.git

  if (slug.match("http")) {
    // Type is http(s)
    const phaseOne = slug.split("//")[1].replace(".git", "");
    const phaseTwo = phaseOne.split("/");
    let cleanSlug = `${phaseTwo[1]}/${phaseTwo[2]}`;
    return cleanSlug;
  } else if (slug.match("@")) {
    // Type is git
    let cleanSlug = slug.split(":")[1].replace(".git", "");
    return cleanSlug;
  }
  throw new Error("Unable to parse slug URL: " + slug);
}

function getSlug(inputs) {
  const { args } = inputs;
  try {
    const slug = child_process
      .spawnSync("git", ["config", "--get", "remote.origin.url"])
      .stdout.toString()
      .trimRight();
    return args.slug || parseSlug(slug);
  } catch (error) {
    throw new Error("There was an error getting the slug from git: " + error);
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
  getSlug,
  getServiceName
};
