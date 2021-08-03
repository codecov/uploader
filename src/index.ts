import { UploaderArgs } from './types'

import zlib from 'zlib'
import { version } from '../package.json'
import * as validateHelpers from './helpers/validate'
import * as webHelpers from './helpers/web'
import { info, verbose } from './helpers/logger'
import providers from './ci_providers'
import { logAndThrow } from './helpers/util'
import { getToken } from './helpers/token'
import {
  coverageFilePatterns,
  fetchGitRoot,
  fileHeader,
  getCoverageFiles,
  getFileListing,
  MARKER_ENV_END,
  MARKER_FILE_END,
  MARKER_NETWORK_END,
  readCoverageFile,
  removeFile,
} from './helpers/files'

/**
 *
 * @param {string} uploadHost
 * @param {string} token
 * @param {string} query
 * @param {string} uploadFile
 * @param {string} source
 */
function dryRun(
  uploadHost: string,
  token: string,
  query: string,
  uploadFile: string,
  source: string,
) {
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
export async function main(
  args: UploaderArgs,
): Promise<void | Record<string, unknown>> {
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

  let uploadHost: string
  if (args.url && validateHelpers.validateURL(args.url)) {
    uploadHost = args.url
  } else {
    uploadHost = 'https://codecov.io'
  }

  info(generateHeader(getVersion()))

  // == Step 2: detect if we are in a git repo
  const projectRoot = args.rootDir || fetchGitRoot()
  if (projectRoot === '') {
    info(
      '=> No git repo detected. Please use the -R flag if the below detected directory is not correct.',
    )
  }

  info(`=> Project root located at: ${projectRoot}`)

  // == Step 3: sanitize and set token
  const token = await getToken(inputs, projectRoot)
  if (token === '') {
    info('-> No token specified or token is empty')
  }

  // == Step 4: get network
  let uploadFile = ''

  if (!args.feature || args.feature.split(',').includes('network') === false) {
    verbose('Start of network processing...', Boolean(args.verbose))
    let fileListing = ''
    try {
      fileListing = await getFileListing(projectRoot, args)
    } catch (error) {
      logAndThrow(`Error getting file listing: ${error}`)
    }

    uploadFile = uploadFile.concat(fileListing).concat(MARKER_NETWORK_END)
  }

  // == Step 5: select coverage files (search or specify)

  // Look for files
  let coverageFilePaths: string[] = []
  info('Searching for coverage files...')
  if (args.file) {
    if (typeof args.file === 'string') {
      coverageFilePaths = [args.file]
    } else {
      coverageFilePaths = args.file
    }
  }
  coverageFilePaths = await getCoverageFiles(
    args.dir || projectRoot,
    coverageFilePaths.length > 0 ? coverageFilePaths : coverageFilePatterns(),
  )
  coverageFilePaths.filter(file => {
    return validateHelpers.validateFileNamePath(file)
  })

  if (coverageFilePaths.length > 0) {
    info(`=> Found ${coverageFilePaths.length} possible coverage files:\n  ` +
        coverageFilePaths.join('\n  '))
  } else {
    const noFilesError = args.file ?
      'No coverage files found, exiting.' :
      'No coverage files located, please try use `-f`, or change the project root with `-R`'
    logAndThrow(noFilesError)
  }

  verbose('End of network processing', Boolean(args.verbose))
  // == Step 6: generate upload file
  // TODO: capture envs

  // Get coverage report contents
  for (const coverageFile of coverageFilePaths) {
    let fileContents
    try {
      info(`Processing ${coverageFile}...`),
        (fileContents = await readCoverageFile(
          args.dir || projectRoot,
          coverageFile,
        ))
    } catch (err) {
      info(`Could not read coverage file (${coverageFile}): ${err}`)
      continue
    }

    uploadFile = uploadFile
      .concat(fileHeader(coverageFile))
      .concat(fileContents)
      .concat(MARKER_FILE_END)
  }

  // Cleanup
  if (args.clean) {
    for (const coverageFile of coverageFilePaths) {
      removeFile(args.dir || projectRoot, coverageFile)
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
    uploadFile = uploadFile.concat(vars).concat(MARKER_ENV_END)
  }

  const gzippedFile = zlib.gzipSync(uploadFile)

  // == Step 7: determine CI provider

  // Determine CI provider
  let serviceParams
  for (const provider of providers) {
    if (provider.detect(envs)) {
      info(`Detected ${provider.getServiceName()} as the CI provider.`)
      verbose('-> Using the following env variables:', Boolean(args.verbose))
      for (const envVarName of provider.getEnvVarNames()) {
        verbose(
          `     ${envVarName}: ${envs[envVarName]}`,
          Boolean(args.verbose),
        )
      }
      serviceParams = provider.getServiceParams(inputs)
      break
    }
  }

  if (serviceParams === undefined) {
    logAndThrow('Unable to detect service, please specify manually.')
    process.exit(args.nonZero ? -1 : 0)
  }

  // == Step 8: either upload or dry-run

  const query = webHelpers.generateQuery(
    webHelpers.populateBuildParams(inputs, serviceParams),
  )

  if (args.dryRun) {
    return dryRun(uploadHost, token, query, uploadFile, args.source || '')
  }

  info(
    `Pinging Codecov: ${uploadHost}/upload/v4?package=${webHelpers.getPackage(
      args.source || '',
    )}&token=*******&${query}`,
  )
  verbose(
    `Passed token was ${token.length} characters long`,
    Boolean(args.verbose),
  )
  try {
    verbose(
      `${uploadHost}/upload/v4?package=${webHelpers.getPackage(
        args.source || '',
      )}&${query}
        Content-Type: 'text/plain'
        Content-Encoding: 'gzip'
        X-Reduced-Redundancy: 'false'`,
      Boolean(args.verbose),
    )

    const uploadURL = await webHelpers.uploadToCodecov(
      uploadHost,
      token,
      query,
      gzippedFile,
      args.source || '',
    )

    verbose(`Returned upload url: ${uploadURL}`, Boolean(args.verbose))

    verbose(
      `${uploadURL.split('\n')[1]}
        Content-Type: 'text/plain'
        Content-Encoding: 'gzip'`,
      Boolean(args.verbose),
    )
    const result = await webHelpers.uploadToCodecovPUT(uploadURL, gzippedFile)
    info(JSON.stringify(result))
    return result
  } catch (error) {
    logAndThrow(`Error uploading to ${uploadHost}: ${error}`)
  }
}

/**
 *
 * @param {string} version
 * @returns {string}
 */
export function generateHeader(version: string): string {
  return `
     _____          _
    / ____|        | |
   | |     ___   __| | ___  ___ _____   __
   | |    / _ \\ / _\` |/ _ \\/ __/ _ \\ \\ / /
   | |___| (_) | (_| |  __/ (_| (_) \\ V /
    \\_____\\___/ \\__,_|\\___|\\___\\___/ \\_/

  Codecov report uploader ${version}`
}

export function getVersion(): string {
  return version
}

export { logError, info, verbose } from './helpers/logger'
