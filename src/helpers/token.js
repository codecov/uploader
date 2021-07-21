const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

const { log } = require('./logger')
const validateHelpers = require('./validate')

function getToken(inputs, projectRoot) {
  const { args, envs } = inputs
  const options = [
    [args.token, 'arguments'],
    [envs.CODECOV_TOKEN, 'environment variables'],
    [getTokenFromYaml(projectRoot), 'Codecov yaml config'],
  ]

  for (const option of options) {
    if (option[0] && validateHelpers.validateToken(option[0])) {
      log(`->  Token set by ${option[1]}`)
      return option[0]
    }
  }

  return ''
}

function getTokenFromYaml(projectRoot) {
  const dirNames = [
    '',
    '.github',
    'dev',
  ]

  const yamlNames = [
    '.codecov.yaml',
    '.codecov.yml',
    'codecov.yaml',
    'codecov.yml',
  ]

  for (const dir of dirNames) {
    for (const name of yamlNames) {
      const filePath = path.join(projectRoot, dir, name);

      try {
        if (fs.existsSync(filePath)) {
          const fileContents = fs.readFileSync(filePath, {
              encoding: 'utf-8',
          });
          const yamlConfig = yaml.load(fileContents);
          if (
              yamlConfig['codecov_token'] &&
              validateHelpers.validateToken(yamlConfig['codecov_token'])
          ) {
            return yamlConfig['codecov_token']
          }
        }
      } catch(err) {
        log(`Error searching for upload token in ${filePath}: ${err}`, { level: 'debug' })
      }
    }
  }
  return ''
}


module.exports = {
  getToken,
  getTokenFromYaml,
}
