/**
 * Detects if this CI provider is being used
 *
 * @param {*} envs an object of enviromental variable key/value pairs
 * @returns boolean
 */
// eslint-disable-next-line no-unused-vars
function detect(envs) {
  return false;
}

/**
 * Determine the build number, based on args and envs
 *
 * @param {args: {}, envs: {}} inputs an object of arguments and enviromental variable key/value pairs
 * @returns String
 */
function _getBuild(inputs) {
  const { args } = inputs;
  return args.build || "";
}

/**
 * Determine the build URL for use in the Codecov UI
 *
 * @param {args: {}, envs: {}} inputs an object of arguments and enviromental variable key/value pairs
 * @returns String
 */
// eslint-disable-next-line no-unused-vars
function _getBuildURL(inputs) {
  return "";
}

/**
 * Determine the branch of the repository, based on args and envs
 *
 * @param {args: {}, envs: {}} inputs an object of arguments and enviromental variable key/value pairs
 * @returns String
 */
function _getBranch(inputs) {
  const { args } = inputs;
  try {
    return args.branch || "";
  } catch (error) {
    throw new Error(
      `There was an error getting the branch name from git: ${error}`
    );
  }
}

/**
 * Determine the job number, based on args or envs
 *
 * @param {*} envs an object of enviromental variable key/value pairs
 * @returns String
 */
// eslint-disable-next-line no-unused-vars
function _getJob(envs) {
  return "";
}

/**
 * Determine the PR number, based on args and envs
 *
 * @param {args: {}, envs: {}} inputs an object of arguments and enviromental variable key/value pairs
 * @returns String
 */
// eslint-disable-next-line no-unused-vars
function _getPR(inputs) {
  return "";
}

/**
 * The CI service name that gets sent to the Codecov uploader as part of the quesry string
 *
 * @returns String
 */
function _getService() {
  return "";
}

/**
 * The CI Service name that gets displayed when running the uploader
 *
 * @returns
 */
function getServiceName() {
  return "";
}
/**
 * Determine the commit SHA that is being uploaded, based on args or envs
 *
 * @param {args: {}, envs: {}} inputs an object of arguments and enviromental variable key/value pairs
 * @returns String
 */
function _getSHA(inputs) {
  const { args } = inputs;
  try {
    return args.sha || "";
  } catch (error) {
    throw new Error(
      `There was an error getting the commit SHA from git: ${error}`
    );
  }
}
/**
 * Determine the slug (org/repo) based on  args or envs
 *
 * @param {args: {}, envs: {}} inputs an object of arguments and enviromental variable key/value pairs
 * @returns String
 */
function _getSlug(inputs) {
  const { args } = inputs;
  try {
    return args.slug || "";
  } catch (error) {
    throw new Error(`There was an error getting the slug from git: ${error}`);
  }
}
/**
 * Generates and return the serviceParams object
 *
 * @param {args: {}, envs: {}} inputs an object of arguments and enviromental variable key/value pairs
 * @returns { branch: String, build: String, buildURL: String, commit: String, job: String, pr: String, service: String, slug: String}
 */
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
