#!/usr/bin/env node

import { logError, main, verbose} from '../src'
import { addArguments } from '../src/helpers/cli'

var argv = require('yargs') // eslint-disable-line


argv.usage('Usage: $0 <command> [options]')
  
addArguments(argv)

  argv.version()
  .help('help')
  .alias('help', 'h').argv

  const realArgs = argv.argv

  const start = Date.now()

verbose(`Start of uploader: ${start}...`, Boolean(argv.verbose))
main(realArgs)
  .then(() => {
    const end = Date.now()
    verbose(`End of uploader: ${end - start} milliseconds`, argv.verbose,
    )
  })
  .catch(error => {
    logError(error)
    const end = Date.now()
    verbose(`End of uploader: ${end - start} milliseconds`, argv.verbose)
    process.exit(Boolean(realArgs.nonZero) ? -1 : 0)
  })
