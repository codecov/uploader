function detect(envs) {
  return envs.CI && envs.CIRCLECI;
}

function getBuildURL(inputs) {
  return "";
}

// This is the value that gets passed to the Codecov uploader
function getService() {
  return "circleci";
}

// This is the name that gets printed
function getServiceName() {
  return "CircleCI";
}

function getBranch(inputs) {
  const { args, envs } = inputs;
  return args.branch || envs.CIRCLE_BRANCH;
}

function getSHA(inputs) {
  const { args, envs } = inputs;
  try {
    const sha = envs.CIRCLE_SHA1;
    return args.sha || sha;
  } catch (error) {
    throw new Error("There was an error getting the commit SHA: ", error);
  }
}

function getSlug(inputs) {
  const { args, envs } = inputs;
  let slug;
  if (envs.CIRCLE_PROJECT_REPONAME !== "") {
    slug = `${envs.CIRCLE_PROJECT_USERNAME}/${envs.CIRCLE_PROJECT_REPONAME}`;
  } else {
    slug = `${envs.CIRCLE_REPOSITORY_URL}.git`;
  }
  return args.slug || slug;
}

function getBuild(inputs) {
  const { args, envs } = inputs;
  return args.build || envs.CIRCLE_BUILD_NUM || "";
}

function getPR(inputs) {
  const { args, envs } = inputs;
  return args.pr || envs.CIRCLE_PR_NUMBER || "";
}

function getJob(envs) {
  return envs.CIRCLE_NODE_INDEX || "";
}

function getServiceParams(inputs) {
  return {
    branch: getBranch(inputs),
    build: getBuild(inputs),
    buildURL: getBuildURL(inputs),
    commit: getSHA(inputs),
    job: getJob(inputs.envs),
    pr: getPR(inputs),
    service: getService(inputs),
    slug: getSlug(inputs)
  };
}

module.exports = {
  detect,
  getBuild,
  getBuildURL,
  getBranch,
  getJob,
  getPR,
  getService,
  getServiceName,
  getServiceParams,
  getSHA,
  getSlug
};
