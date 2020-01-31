const processHelper = require("../helpers/process")

function detect(envs) {
  return envs.CI && envs.CIRCLECI;
}

function getServiceName() {
  return "CircleCI";
}

function getService() {
  return "circleci";
}

function getBranch(envs, args) {
  return args.branch || envs.CIRCLE_BRANCH;
}

function getSHA(envs, args) {
  try {
    const sha = envs.CIRCLE_SHA1;
    return args.sha || sha;
  } catch (error) {
    console.error("There was an error getting the commit SHA: ", error)
    processHelper.exitNonZeroIfSet(envs, args)
  }
}

function getSlug(envs, args) {
  let slug
  if (envs.CIRCLE_PROJECT_REPONAME !== "") {
    
    slug = `${envs.CIRCLE_PROJECT_USERNAME}/${envs.CIRCLE_PROJECT_REPONAME}`;
  } else {
    slug = `${envs.CIRCLE_REPOSITORY_URL}.git`;
  }
  return args.slug || slug;
}

function getBuild(envs, args) {
  return args.build || envs.CIRCLE_BUILD_NUM || "";
}

function getPR(envs, args) {
  return args.pr || envs.CIRCLE_PR_NUMBER || "";
}

// eslint-disable-next-line no-unused-vars
function getJob(envs, args) {
  return envs.CIRCLE_NODE_INDEX || "";
}

function getServiceParams(envs, args) {
  return {
    branch: getBranch(envs, args),
    commit: getSHA(envs, args),
    build: getBuild(envs, args),
    buildURL: "",
    slug: args.slug || getSlug(envs, args),
    service: getService(envs, args),
    pr: getPR(envs, args),
    job: getJob(envs, args)
  };
}

module.exports = {
  detect,
  getServiceParams,
  getService,
  getServiceName,
  getSlug
};
