const child_process = require("child_process");

function detect(envs) {
  return !envs.CI;
}

function _getBuild(inputs) {
  const { args } = inputs;
  return args.build || "";
}

// eslint-disable-next-line no-unused-vars
function _getBuildURL(inputs) {
  return "";
}

function _getBranch(inputs) {
  const { args } = inputs;
  try {
    const branchName = child_process
      .spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"])
      .stdout.toString()
      .trimRight();
    return args.branch || branchName;
  } catch (error) {
    throw new Error(
      `There was an error getting the branch name from git: ${error}`
    );
  }
}

// eslint-disable-next-line no-unused-vars
function _getJob(envs) {
  return "";
}

// eslint-disable-next-line no-unused-vars
function _getPR(inputs) {
  return "";
}

// This is the value that gets passed to the Codecov uploader
function _getService() {
  return "";
}

// This is the name that gets printed
function getServiceName() {
  return "Local";
}

function _getSHA(inputs) {
  const { args } = inputs;
  try {
    const sha = child_process
      .spawnSync("git", ["rev-parse", "HEAD"])
      .stdout.toString()
      .trimRight();
    return args.sha || sha;
  } catch (error) {
    throw new Error(
      `There was an error getting the commit SHA from git: ${error}`
    );
  }
}

function _parseSlug(slug) {
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
  throw new Error(`Unable to parse slug URL: ${slug}`);
}

function _getSlug(inputs) {
  const { args } = inputs;
  try {
    const slug = child_process
      .spawnSync("git", ["config", "--get", "remote.origin.url"])
      .stdout.toString()
      .trimRight();
    return args.slug || _parseSlug(slug);
  } catch (error) {
    throw new Error(`There was an error getting the slug from git: ${error}`);
  }
}

function getServiceParams(inputs) {
  return {
    branch: _getBranch(inputs),
    build: _getBuild(inputs),
    buildURL: _getBuildURL(inputs),
    commit: _getSHA(inputs),
    job: _getJob(inputs),
    pr: _getPR(inputs),
    service: _getService(),
    slug: _getSlug(inputs)
  };
}

module.exports = {
  private: {
    _getBuild,
    _getBuildURL,
    _getBranch,
    _getJob,
    _getPR,
    _getService,
    _getSHA,
    _getSlug
  },
  detect,
  getServiceName,
  getServiceParams
};
