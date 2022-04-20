import fs from 'fs'
import yaml from 'js-yaml'
import path from 'path'
import { UploaderInputs } from '../types'
import { DEFAULT_UPLOAD_HOST } from './constansts'
import { info, logError, UploadLogger } from './logger'
import { validateToken } from './validate'

/**
 *
 * @param {object} inputs
 * @param {string} projectRoot
 * @returns string
 */
export function getToken(inputs: UploaderInputs, projectRoot: string): string {
  const { args, environment: envs } = inputs
  const options = [
    [args.token, 'arguments'],
    [envs.CODECOV_TOKEN, 'environment variables'],
    [getTokenFromYaml(projectRoot), 'Codecov yaml config'],
  ]

  for (const [token, source] of options) {
    if (token) {
      info(`->  Token found by ${source}`)
      // If this is self-hosted (-u is set), do not validate
      // This is because self-hosted can use a global upload token
      if (args.url !== DEFAULT_UPLOAD_HOST) {
        UploadLogger.verbose('Self-hosted install detected due to -u flag')
        info(`->  Token set by ${source}`)
        return token
      }
      if (validateToken(token) !== true) {
        throw new Error(
          `Token found by ${source} with length ${token?.length} did not pass validation`,
        )
      }

      return token
    }
  }

  return ''
}

interface ICodecovYAML {
  codecov?: {
    token?: string
  }
  codecov_token?: string
}

// eslint-disable-next-line @typescript-eslint/ban-types
function yamlParse(input: object | string | number): ICodecovYAML {
  let yaml: ICodecovYAML
  if (typeof input === 'string') {
    yaml = JSON.parse(input)
  } else if (typeof input === 'number') {
    yaml = JSON.parse(input.toString())
  } else {
    yaml = input
  }
  return yaml
}

export function getTokenFromYaml(
  projectRoot: string,
): string {
  const dirNames = ['', '.github', 'dev']

  const yamlNames = [
    '.codecov.yaml',
    '.codecov.yml',
    'codecov.yaml',
    'codecov.yml',
  ]

  for (const dir of dirNames) {
    for (const name of yamlNames) {
      const filePath = path.join(projectRoot, dir, name)

      try {
        if (fs.existsSync(filePath)) {
          const fileContents = fs.readFileSync(filePath, {
            encoding: 'utf-8',
          })
          const yamlConfig: ICodecovYAML = yamlParse(
            new Object(yaml.load(fileContents, { json: true }) || {},
          ))
          if (
            yamlConfig['codecov'] &&
            yamlConfig['codecov']['token'] &&
            validateToken(yamlConfig['codecov']['token'])
          ) {
            return yamlConfig['codecov']['token']
          }

          if (yamlConfig['codecov_token']) {
            logError(
              `'codecov_token' is a deprecated field. Please switch to 'codecov.token' ` +
                '(https://docs.codecov.com/docs/codecovyml-reference#codecovtoken)',
            )
          }
        }
      } catch (err) {
        UploadLogger.verbose(`Error searching for upload token in ${filePath}: ${err}`)
      }
    }
  }
  return ''
}
