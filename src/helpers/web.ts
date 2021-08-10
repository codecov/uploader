import { IServiceParams, UploaderInputs } from '../types'

import superagent from 'superagent'
import { version } from '../../package.json'
import * as validateHelpers from './validate'
import { info, logError } from './logger'
import { logAndThrow } from './util'
import { checkValueType } from './validate'

/**
 *
 * @param {Object} inputs
 * @param {NodeJS.ProcessEnv} inputs.envs
 * @param {Object} serviceParams
 * @returns Object
 */
export function populateBuildParams(
  inputs: UploaderInputs,
  serviceParams: IServiceParams,
): IServiceParams {
  const { args, envs } = inputs
  serviceParams.name = args.name || envs.CODECOV_NAME || ''
  serviceParams.tag = args.tag || ''
  let flags: string[]
  if (typeof args.flags === 'object') {
    flags = [...args.flags]
  } else {
    flags = [args.flags]
  }
  serviceParams.flags = flags
    .filter(flag => validateHelpers.validateFlags(flag))
    .join(',')
  serviceParams.parent = args.parent || ''
  return serviceParams
}

export function getPackage(source: string): string {
  if (source) {
    return `${source}-uploader-${version}`
  } else {
    return `uploader-${version}`
  }
}

export async function uploadToCodecovPUT(
  uploadURL: string,
  uploadFile: string | Buffer,
): Promise<{ status: string, resultURL: string }> {
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

interface SuperAgentResponse extends superagent.Response {
  res?: {
    text: string
  }
}

export async function uploadToCodecov(
  uploadURL: string,
  token: string,
  query: string,
  uploadFile: string | Buffer,
  source: string,
): Promise<string> {
  const result: SuperAgentResponse = await superagent
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
      logError(
        `Error uploading to Codecov when fetching PUT (inner): ${err.status} ${err.response.text}`,
      )
    })
    .ok(res => res.status === 200)

  if (result.res) {
    return result.res.text
  }
  logAndThrow(`We don't have a PUT URL`)
}

/**
 *
 * @param {string} str
 * @returns {string}
 */
function camelToSnake(str: string): string {
  return (
    str &&
    (
      str.match(
        /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g,
      ) || []
    )
      .map((s: string) => s.toLowerCase())
      .join('_')
  )
}

/**
 *
 * @param {Object} queryParams
 * @returns {string}
 */
export function generateQuery(queryParams: IServiceParams): string {
  checkValueType('pr', queryParams.pr, 'number')
  if (queryParams.pr === 0) {
    queryParams.pr = ''
  }
  return Object.entries(queryParams)
    .map(([key, value]) => `${camelToSnake(key)}=${value}`)
    .join('&')
}

