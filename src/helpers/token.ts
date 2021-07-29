import { UploaderArgs, UploaderInputs } from "../types"

const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

const { error, info, verbose } = require('./logger')
const validateHelpers = require('./validate')

/**
 *
 * @param {object} inputs
 * @param {string} projectRoot
 * @returns string
 */
export function getToken(inputs: UploaderInputs, projectRoot: string) {
  const { args, envs } = inputs
  const options = [
    [args.token, 'arguments'],
    [envs.CODECOV_TOKEN, 'environment variables'],
    [getTokenFromYaml(projectRoot, args), 'Codecov yaml config'],
  ]

  for (const option of options) {
    if (option[0] && validateHelpers.validateToken(option[0])) {
      info(`->  Token set by ${option[1]}`)
      return option[0]
    }
  }

  return ''
}

export function getTokenFromYaml(projectRoot: string, args: UploaderArgs) {
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
          const yamlConfig = yaml.load(fileContents)
          if (
            yamlConfig['codecov'] &&
            yamlConfig['codecov']['token'] &&
            validateHelpers.validateToken(yamlConfig['codecov']['token'])
          ) {
            return yamlConfig['codecov']['token']
          }

          if (yamlConfig['codecov_token']) {
            error(
              `'codecov_token' is a deprecated field. Please switch to 'codecov.token' ` +
              '(https://docs.codecov.com/docs/codecovyml-reference#codecovtoken)'
            )
          }
        }
      } catch (err) {
        verbose(
          `Error searching for upload token in ${filePath}: ${err}`,
          args.verbose,
        )
      }
    }
  }
  return ''
}
