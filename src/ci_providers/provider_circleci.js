function detect(envs) {
  return envs.CI && envs.CIRCLECI;
}

function getServiceName() {
  return "CircleCI";
}

function getService() {
  return "circleci";
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

// eslint-disable-next-line no-unused-vars
function getJob(envs) {
  return envs.CIRCLE_NODE_INDEX || "";
}

function getServiceParams(inputs) {
  return {
    branch: getBranch(inputs),
    commit: getSHA(inputs),
    build: getBuild(inputs),
    buildURL: "",
    slug: inputs.args.slug || getSlug(inputs),
    service: getService(inputs),
    pr: getPR(inputs),
    job: getJob(inputs.envs)
  };
}

module.exports = {
  detect,
  getServiceParams,
  getService,
  getServiceName,
  getSlug
};
