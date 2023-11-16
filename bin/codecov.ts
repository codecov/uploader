#!/usr/bin/env node

import { logError, main, verbose } from '../src'
import { addArguments } from '../src/helpers/cli'
import { info } from '../src/helpers/logger'

var argv = require('yargs') // eslint-disable-line

argv.usage('Usage: $0 <command> [options]')

addArguments(argv)

argv.version().help('help').alias('help', 'h').argv

const realArgs = argv.argv

const start = Date.now()

verbose(`Start of uploader: ${start}...`, realArgs.verbose)
main(realArgs)
  .then(() => {
    const end = Date.now()
    verbose(`End of uploader: ${end - start} milliseconds`, realArgs.verbose)
  })
  .catch(error => {
    if (error instanceof Error) {
      logError(`There was an error running the uploader: ${error.message}`)
      verbose(`The error stack is: ${error.stack}`, realArgs.verbose)
    }

    const end = Date.now()
    verbose(`End of uploader: ${end - start} milliseconds`, realArgs.verbose)

    if (!realArgs.nonZero) {
      info('Codecov will exit with status code 0. If you are expecting a non-zero exit code, please pass in the `-Z` flag')
    }
    process.exit(realArgs.nonZero ? -1 : 0)
  })
