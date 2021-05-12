const zlib = require('zlib')
const { version } = require('../package.json')
const fileHelpers = require('./helpers/files')
const validateHelpers = require('./helpers/validate')
const webHelpers = require('./helpers/web')
const providers = require('./ci_providers')

function dryRun (uploadHost, token, query, uploadFile) {
  console.log('==> Dumping upload file (no upload)')
  console.log(
    `${uploadHost}/upload/v4?package=uploader-${version}&token=${token}&${query}`
  )
  console.log(uploadFile)
  process.exit()
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
 */
async function main (args) {
  try {
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
    let token = validateHelpers.validateToken(args.token) ? args.token : ''
    if (token === '') {
      token = process.env.CODECOV_TOKEN || ''
    }
    token = args.token || process.env.CODECOV_TOKEN || ''
    console.log(generateHeader(getVersion()))

    // == Step 2: detect if we are in a git repo
    const projectRoot = args.rootDir || fileHelpers.fetchGitRoot()
    if (projectRoot === '') {
      console.log(
        '=> No git repo detected. Please use the -R flag if the below detected directory is not correct.'
      )
    }

    console.log(`=> Project root located at: ${projectRoot}`)

    // == Step 3: get network
    const fileListing = await fileHelpers.getFileListing(projectRoot)

    // == Step 4: select coverage files (search or specify)

    // Look for files
    let coverageFilePaths = []
    if (!args.file) {
      coverageFilePaths = fileHelpers.getCoverageFiles(
        args.dir || projectRoot,
        // TODO: Determine why this is so slow (I suspect it's walking paths it should not)
        fileHelpers.coverageFilePatterns()
      )
      if (coverageFilePaths.length > 0) {
        console.log(
          `=> Found ${coverageFilePaths.length} possible coverage files:`
        )
        console.log(coverageFilePaths.join('\n'))
      } else {
        console.error(
          'No coverage files located, please try use `-f`, or change the project root with `-R`'
        )
        process.exit(args.nonZero ? -1 : 0)
      }
    } else {
      coverageFilePaths[0] = validateHelpers.validateFileNamePath(args.file)
        ? args.file
        : ''
      if (coverageFilePaths.length === 0) {
        console.error('Not coverage file found, exiting.')
        process.exit(args.nonZero ? -1 : 0)
      }
    }

    // == Step 5: generate upload file
    // TODO: capture envs
    let uploadFile = fileListing

    uploadFile = uploadFile.concat(fileHelpers.endNetworkMarker())

    // Get coverage report contents
    for (let index = 0; index < coverageFilePaths.length; index++) {
      const coverageFile = coverageFilePaths[index]
      const fileContents = await fileHelpers.readCoverageFile(
        args.dir || projectRoot,
        coverageFile
      )
      uploadFile = uploadFile.concat(fileHelpers.fileHeader(coverageFile))
      uploadFile = uploadFile.concat(fileContents)
      uploadFile = uploadFile.concat(fileHelpers.endFileMarker())
    }

    // Environment variables
    if (args.env || envs.CODECOV_ENV) {
      const environmentVars = args.env || envs.CODECOV_ENV
      const vars = environmentVars
        .split(',')
        .filter(Boolean)
        .map(evar => `${evar}=${process.env[evar] || ''}\n`)
        .join('')
      uploadFile = uploadFile.concat(vars)
      uploadFile = uploadFile.concat(fileHelpers.endEnvironmentMarker())
    }

    const gzippedFile = zlib.gzipSync(uploadFile)

    // == Step 6: determine CI provider

    // Determine CI provider
    let serviceParams
    for (const provider of providers) {
      if (provider.detect(envs)) {
        console.log(
          `Detected ${provider.getServiceName()} as the CI provider.`
        )
        serviceParams = provider.getServiceParams(inputs)
        break
      }
    }

    if (serviceParams === undefined) {
      console.error('Unable to detect service, please specify manually.')
      process.exit(args.nonZero ? -1 : 0)
    }

    // == Step 7: either upload or dry-run

    const query = webHelpers.generateQuery(
      webHelpers.populateBuildParams(inputs, serviceParams)
    )

    if (args.dryRun) {
      dryRun(uploadHost, token, query, uploadFile)
    } else {
      console.log(
        `Pinging Codecov: ${uploadHost}/v4?package=uploader-${version}&token=*******&${query}`
      )
      const uploadURL = await webHelpers.uploadToCodecov(
        uploadHost,
        token,
        query,
        gzippedFile,
        version
      )
      const result = await webHelpers.uploadToCodecovPUT(
        uploadURL,
        gzippedFile
      )
      console.log(result)
      return result
    }
  } catch (error) {
    // Output any exceptions and exit
    console.error(error.message)
    process.exit(args.nonZero ? -1 : 0)
  }
}

function generateHeader (version) {
  return `
     _____          _
    / ____|        | |
   | |     ___   __| | ___  ___ _____   __
   | |    / _ \\ / _\` |/ _ \\/ __/ _ \\ \\ / /
   | |___| (_) | (_| |  __/ (_| (_) \\ V /
    \\_____\\___/ \\__,_|\\___|\\___\\___/ \\_/

  Codecov report uploader ${version}`
}

function getVersion () {
  return version
}

module.exports = {
  main,
  getVersion,
  generateHeader
}
