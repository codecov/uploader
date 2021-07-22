// @ts-check
const zlib = require('zlib')
const { version } = require('../package.json')
const fileHelpers = require('./helpers/files')
const validateHelpers = require('./helpers/validate')
const tokenHelpers = require('./helpers/token')
const webHelpers = require('./helpers/web')
const { error, info, verbose } = require('./helpers/logger')
const providers = require('./ci_providers')

/**
 *
 * @param {string} uploadHost
 * @param {string} token
 * @param {string} query
 * @param {string} uploadFile
 * @param {string} source
 */
function dryRun(uploadHost, token, query, uploadFile, source) {
  info('==> Dumping upload file (no upload)')
  info(
    `${uploadHost}/upload/v4?package=${webHelpers.getPackage(
      source,
    )}&token=${token}&${query}`,
  )
  info(uploadFile)
}

/**
 *
 * @param {Object} args
 * @param {string} args.build Specify the build number manually
 * @param {string} args.branch Specify the branch manually
 * @param {string} args.dir Directory to search for coverage reports.
 * @param {string} args.env Specify environment variables to be included with this build
 * @param {string} args.sha Specify the commit SHA mannually
 * @param {string} args.file Target file(s) to upload
 * @param {string} args.flags Flag the upload to group coverage metrics
 * @param {string} args.name Custom defined name of the upload. Visible in Codecov UI
 * @param {string} args.parent The commit SHA of the parent for which you are uploading coverage.
 * @param {string} args.pr Specify the pull request number mannually
 * @param {string} args.token Codecov upload token
 * @param {string} args.tag Specify the git tag
 * @param {boolean} args.verbose Run with verbose logging
 * @param {string} args.rootDir Specify the project root directory when not in a git repo
 * @param {boolean} args.nonZero Should errors exit with a non-zero (default: false)
 * @param {boolean} args.dryRun Don't upload files to Codecov
 * @param {string} args.slug Specify the slug manually (Enterprise use)
 * @param {string} args.url Change the upload host (Enterprise use)
 * @param {boolean} args.clean Move discovered coverage reports to the trash
 * @param {string} args.feature Toggle features
 * @param {string} args.source Track wrappers of the uploader
 */
async function main(args) {
  /*
  Step 1: validate and sanitize inputs
  Step 2: detect if we are in a git repo
  Step 3: get network (file listing)
  Step 4: select coverage files (search or specify)
  Step 5: generate upload file
  Step 6: determine CI provider
  Step 7: either upload or dry-run
  */

  // == Step 1: validate and sanitize inputs
  // TODO: clean and sanitize envs and args
  const envs = process.env
  // args
  const inputs = { args, envs }

  const uploadHost = validateHelpers.validateURL(args.url)
    ? args.url
    : 'https://codecov.io'

  info(generateHeader(getVersion()))

  // == Step 2: detect if we are in a git repo
  const projectRoot = args.rootDir || fileHelpers.fetchGitRoot()
  if (projectRoot === '') {
    info(
      '=> No git repo detected. Please use the -R flag if the below detected directory is not correct.',
    )
  }

  info(`=> Project root located at: ${projectRoot}`)

  // == Step 3: sanitize and set token
  const token = await tokenHelpers.getToken(inputs, projectRoot)

  // == Step 4: get network
  let uploadFile = ''

  if (!args.feature || args.feature.split(',').includes('network') === false) {
    verbose('Start of network processing...', args.verbose)
    let fileListing
    try {
      fileListing = await fileHelpers.getFileListing(projectRoot, args)
    } catch (error) {
      throw new Error(`Error getting file listing: ${error}`)
    }

    uploadFile = uploadFile
      .concat(fileListing)
      .concat(fileHelpers.endNetworkMarker())
  }

  // == Step 5: select coverage files (search or specify)

  // Look for files
  let coverageFilePaths = []
  if (!args.file) {
    info('Searching for coverage files...')
    coverageFilePaths = fileHelpers.getCoverageFiles(
      args.dir || projectRoot,
      // TODO: Determine why this is so slow (I suspect it's walking paths it should not)
      fileHelpers.coverageFilePatterns(),
    )
    if (coverageFilePaths.length > 0) {
      info(`=> Found ${coverageFilePaths.length} possible coverage files:`)
      info(coverageFilePaths.join('\n'))
    } else {
      throw new Error(
        'No coverage files located, please try use `-f`, or change the project root with `-R`',
      )
    }
  } else {
    if (typeof args.file === 'string') {
      coverageFilePaths = [args.file]
    } else {
      coverageFilePaths = args.file
    }

    coverageFilePaths.filter(file => {
      return validateHelpers.validateFileNamePath(file)
    })
    if (coverageFilePaths.length === 0) {
      throw new Error('No coverage files found, exiting.')
    }
  }
  verbose('End of network processing', args.verbose)

  // == Step 6: generate upload file
  // TODO: capture envs

  // Get coverage report contents
  for (const coverageFile of coverageFilePaths) {
    let fileContents
    try {
      info(`Processing ${coverageFile}...`),
        (fileContents = await fileHelpers.readCoverageFile(
          args.dir || projectRoot,
          coverageFile,
        ))
    } catch (err) {
      info(`Could not read coverage file (${coverageFile}): ${err}`)
      continue
    }

    uploadFile = uploadFile
      .concat(fileHelpers.fileHeader(coverageFile))
      .concat(fileContents)
      .concat(fileHelpers.endFileMarker())
  }

  // Cleanup
  if (args.clean) {
    for (const coverageFile of coverageFilePaths) {
      fileHelpers.removeFile(args.dir || projectRoot, coverageFile)
    }
  }

  // Environment variables
  if (args.env || envs.CODECOV_ENV) {
    const environmentVars = args.env || envs.CODECOV_ENV || ''
    const vars = environmentVars
      .split(',')
      .filter(Boolean)
      .map(evar => `${evar}=${process.env[evar] || ''}\n`)
      .join('')
    uploadFile = uploadFile
      .concat(vars)
      .concat(fileHelpers.endEnvironmentMarker())
  }

  const gzippedFile = zlib.gzipSync(uploadFile)

  // == Step 7: determine CI provider

  // Determine CI provider
  let serviceParams
  for (const provider of providers) {
    if (provider.detect(envs)) {
      info(`Detected ${provider.getServiceName()} as the CI provider.`)
      serviceParams = provider.getServiceParams(inputs)
      break
    }
  }

  if (serviceParams === undefined) {
    throw new Error('Unable to detect service, please specify manually.')
  }

  // == Step 8: either upload or dry-run

  const query = webHelpers.generateQuery(
    webHelpers.populateBuildParams(inputs, serviceParams),
  )

  if (args.dryRun) {
    return dryRun(uploadHost, token, query, uploadFile, args.source)
  }

  info(
    `Pinging Codecov: ${uploadHost}/upload/v4?package=${webHelpers.getPackage(
      args.source,
    )}&token=*******&${query}`,
  )
  verbose(`Passed token was ${token.length} characters long`, args.verbose)
  try {
    info(
      `${uploadHost}/upload/v4?package=${webHelpers.getPackage(
        args.source,
      )}&${query}
        Content-Type: 'text/plain'
        Content-Encoding: 'gzip'
        X-Reduced-Redundancy: 'false'`,
      { level: 'debug', args },
    )

    const uploadURL = await webHelpers.uploadToCodecov(
      uploadHost,
      token,
      query,
      gzippedFile,
      args.source,
    )

    verbose(uploadURL, args.verbose)

    verbose(
      `${uploadURL.split('\n')[1]}
        Content-Type: 'text/plain'
        Content-Encoding: 'gzip'`,
      args.verbose,
    )
    const result = await webHelpers.uploadToCodecovPUT(uploadURL, gzippedFile)
    info(JSON.stringify(result))
    return result
  } catch (error) {
    throw new Error(`Error uploading to ${uploadHost}: ${error}`)
  }
}

/**
 *
 * @param {string} version
 * @returns {string}
 */
function generateHeader(version) {
  return `
     _____          _
    / ____|        | |
   | |     ___   __| | ___  ___ _____   __
   | |    / _ \\ / _\` |/ _ \\/ __/ _ \\ \\ / /
   | |___| (_) | (_| |  __/ (_| (_) \\ V /
    \\_____\\___/ \\__,_|\\___|\\___\\___/ \\_/

  Codecov report uploader ${version}`
}

function getVersion() {
  return version
}

module.exports = {
  main,
  getVersion,
  generateHeader,
  verbose,
}
