import { snakeCase } from 'snake-case'
import superagent from 'superagent'

import { version } from '../../package.json'
import { IServiceParams, UploaderArgs, UploaderInputs } from '../types'
import { info, logError, verbose } from './logger'
import * as validateHelpers from './validate'
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
  serviceParams: Partial<IServiceParams>,
): Partial<IServiceParams> {
  const { args, environment: envs } = inputs
  serviceParams.name = args.name || envs.CODECOV_NAME || ''
  serviceParams.tag = args.tag || ''

  let flags: string[]
  if (typeof args.flags === 'object') {
    flags = [...args.flags]
  } else {
    flags = (args.flags || '').split(',')
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
): Promise<{ status: string; resultURL: string }> {
  info('Uploading...')

  const { putURL, resultURL } = parsePOSTResults(uploadURL)

  try {
    const result = await superagent
      .put(`${putURL}`)
      .retry()
      .send(uploadFile)
      .set('Content-Type', 'text/plain')
      .set('Content-Encoding', 'gzip')

    if (result.status === 200) {
      return { status: 'success', resultURL }
    }
    throw new Error(`${result.status}, ${result.body}`)
  } catch (error) {
    throw new Error(`Error PUTing file to storage: ${error}`)
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
    .set('X-Upload-Token', token)
    .set('X-Reduced-Redundancy', 'false')
    .on('error', err => {
      logError(
        `Error POSTing to ${uploadURL}: ${err.status} ${err.response?.text}`,
      )
    })
    .ok(res => res.status === 200)

  if (result.res) {
    return result.res.text
  }
  throw new Error(`There was an error fetching the storage URL during POST`)
}

/**
 *
 * @param {Object} queryParams
 * @returns {string}
 */
export function generateQuery(queryParams: Partial<IServiceParams>): string {
  return new URLSearchParams(Object.entries(queryParams)
    .map(([key, value]) => [snakeCase(key), value])
  ).toString()
}

export function parsePOSTResults(uploadURL: string): {
  putURL: string
  resultURL: string
} {
  // JS for [[:graph:]] https://www.regular-expressions.info/posixbrackets.html
  const re = /([\x21-\x7E]+)[\r\n]?/gm

  const matches = uploadURL.match(re)

  if (matches === null) {
    throw new Error(`Parsing results from POST failed: (${uploadURL})`)
  }

  if (matches?.length !== 2) {
    throw new Error(`Incorrect number of urls when parsing results from POST: ${matches.length}`)
  }

  const putURL = matches[1]
  const resultURL = matches[0].trimEnd() // This match may have trailing 0x0A and 0x0D that must be trimmed

  return { putURL, resultURL }
}
