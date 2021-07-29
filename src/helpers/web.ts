import superagent from 'superagent'
import { version } from '../../package.json'
import * as validateHelpers from './validate'
import { logError, info, verbose } from './logger'
import { logAndThrow } from './util'
import { IServiceParams, UploaderInputs } from '../types'

/**
 *
 * @param {Object} inputs
 * @param {UploaderEnvs} inputs.envs
 * @param {Object} serviceParams
 * @returns Object
 */
export function populateBuildParams(
  inputs: UploaderInputs,
  serviceParams: IServiceParams,
) {
  const { args, envs } = inputs
  serviceParams.name = args.name || envs.CODECOV_NAME?.toString() || ''
  serviceParams.tag = args.tag || ''
  let flags: string[]
  if (typeof args.flags === 'object') {
    flags = [...args.flags]
  } else {
    flags = [args.flags || '']
  }
  serviceParams.flags = flags
    .filter((flag: string) => validateHelpers.validateFlags(flag))
    .join(',')
  serviceParams.parent = args.parent || ''
  return serviceParams
}

export function getPackage(source: string) {
  if (source) {
    return `${source}-uploader-${version}`
  } else {
    return `uploader-${version}`
  }
}

/**
 *
 * @param {string} uploadURL
 * @param {Buffer} uploadFile
 * @returns {Promise<{ status: string, resultURL: string }>}
 */
export async function uploadToCodecovPUT(
  uploadURL: string,
  uploadFile: Buffer,
) {
  info('Uploading...')

  const parts = uploadURL.split('\n')
  const putURL = parts[1]
  const codecovResultURL = parts[0]

  try {
    const result = await superagent
      .put(`${putURL}`)
      .retry()
      .send(uploadFile)
      .set('Content-Type', 'text/plain')
      .set('Content-Encoding', 'gzip')

    if (result.status === 200) {
      return { status: 'success', resultURL: codecovResultURL }
    }
    logAndThrow(
      `Error uploading during PUT (inner): ${result.status}, ${result.body}`,
    )
  } catch (error) {
    logAndThrow(`Error uploading during PUT (outer): ${error}`)
  }
}

/**
 *
 * @param {string} uploadURL The upload url
 * @param {string} token Codecov token
 * @param {string} query Query parameters
 * @param {Buffer} uploadFile Coverage file to upload
 * @param {string} version uploader version number
 * @returns {Promise<string>}
 */
export async function uploadToCodecov(
  uploadURL: string,
  token: string,
  query: string,
  uploadFile: Buffer,
  source: string,
) {
  const result = await superagent
    .post(
      `${uploadURL}/upload/v4?package=${getPackage(
        source,
      )}&token=${token}&${query}`,
    )
    .retry()
    .send(uploadFile)
    .set('Content-Type', 'text/plain')
    .set('Content-Encoding', 'gzip')
    .set('X-Upload-Token', token)
    .set('X-Reduced-Redundancy', 'false')
    .on('error', err => {
      logAndThrow(
        `Error uploading to Codecov when fetching PUT (inner): ${err.status} ${err.response.text}`,
      )
    })
    .ok(res => res.status === 200)

  return result.text
}

/**
 *
 * @param {string} str
 * @returns {string}
 */
export function camelToSnake(str: string): string {
  const snakeCase = str.match(
    /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g,
  )

  if (snakeCase) {
    return snakeCase.map(s => s.toLowerCase()).join('_')
  }

  return str
}

/**
 *
 * @param {Object} queryParams
 * @returns {string}
 */
export function generateQuery(queryParams: IServiceParams) {
  return Object.entries(queryParams)
    .map(([key, value]) => `${camelToSnake(key)}=${value}`)
    .join('&')
}
