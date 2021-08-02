import { UploaderArgs } from "../types"

import childProcess from 'child_process'
import fs from 'fs'
import glob from 'fast-glob'
import { posix as  path } from 'path'
import { logAndThrow } from './util'
import { logError, info, verbose } from './logger'

/**
 *
 * @param {string} projectRoot
 * @param {Object} args
 * @returns {Promise<string>}
 */
export async function getFileListing(projectRoot: string, args: UploaderArgs): Promise<string> {
  return getAllFiles(projectRoot, projectRoot, args).join('')
}

export function manualBlacklist() {
  // TODO: honor the .gitignore file instead of a hard-coded list
  return [
    'node_modules',
    '.git',
    '.nyc_output',
    '.circleci',
    '.nvmrc',
    '.gitignore',
    '.DS_Store',
    'vendor',
  ]
}

export function globBlacklist() {
  // TODO: honor the .gitignore file instead of a hard-coded list
  return [
    'node_modules/**/*',
    'vendor',
    '.git',
    '.nyc_output',
    '.circleci',
    '.nvmrc',
    '.gitignore',
    '*.am',
    '*.bash',
    '*.bat',
    '*.bw',
    '*.cfg',
    '*.class',
    '*.cmake',
    '*.cmake',
    '*.conf',
    '*.coverage',
    '*.cp',
    '*.cpp',
    '*.crt',
    '*.css',
    '*.csv',
    '*.csv',
    '*.data',
    '*.db',
    '*.dox',
    '*.ec',
    '*.ec',
    '*.egg',
    '*.el',
    '*.env',
    '*.erb',
    '*.exe',
    '*.ftl',
    '*.gif',
    '*.gradle',
    '*.gz',
    '*.h',
    '*.html',
    '*.in',
    '*.jade',
    '*.jar*',
    '*.jpeg',
    '*.jpg',
    '*.js',
    '*.less',
    '*.log',
    '*.m4',
    '*.mak*',
    '*.map',
    '*.md',
    '*.o',
    '*.p12',
    '*.pem',
    '*.png',
    '*.pom*',
    '*.profdata',
    '*.proto',
    '*.ps1',
    '*.pth',
    '*.py',
    '*.pyc',
    '*.pyo',
    '*.rb',
    '*.rsp',
    '*.rst',
    '*.ru',
    '*.sbt',
    '*.scss',
    '*.scss',
    '*.serialized',
    '*.sh',
    '*.snapshot',
    '*.sql',
    '*.svg',
    '*.tar.tz',
    '*.template',
    '*.ts',
    '*.whl',
    '*.xcconfig',
    '*.xcoverage.*',
    '*/classycle/report.xml',
    '*codecov.yml',
    '*~',
    '.*coveragerc',
    '.coverage*',
    'coverage-summary.json',
    'createdFiles.lst',
    'fullLocaleNames.lst',
    'include.lst',
    'inputFiles.lst',
    'phpunit-code-coverage.xml',
    'phpunit-coverage.xml',
    'remapInstanbul.coverage*.json',
    'scoverage.measurements.*',
    'test_*_coverage.txt',
    'testrunner-coverage*',
  ]
}

export function coverageFilePatterns() {
  return [
    '*coverage*.*',
    'nosetests.xml',
    'jacoco*.xml',
    'clover.xml',
    'report.xml',
    '*.codecov.!(exe)',
    'codecov.!(exe)',
    'cobertura.xml',
    'excoveralls.json',
    'luacov.report.out',
    'coverage-final.json',
    'naxsi.info',
    'lcov.info',
    'lcov.dat',
    '*.lcov',
    '*.clover',
    'cover.out',
    'gcov.info',
    '*.gcov',
    '*.lst',
  ]
}

/**
 *
 * @param {string} projectRoot
 * @param {string[]} coverageFilePatterns
 * @returns {Promise<string[]>}
 */
export async function getCoverageFiles(projectRoot: string, coverageFilePatterns: string[]): Promise<string[]> {
  const globstar = (pattern: string) => `**/${pattern}`

  return glob(coverageFilePatterns.map(globstar), {
    cwd: projectRoot,
    ignore: globBlacklist(),
  })
}

/**
 *
 * @param {string} projectRoot
 * @param {string} file
 * @param {string[]} manualBlacklist
 * @returns boolean
 */
export function isBlacklisted(projectRoot: string, file: string, manualBlacklist: string[]) {
  const blacklist = manualBlacklist
  return blacklist.includes(file)
}

export function fetchGitRoot() {
  try {
    return (
      childProcess.spawnSync('git', ['rev-parse', '--show-toplevel'], {
        encoding: 'utf-8',
      }).stdout ||
      process.cwd()
    ).trimRight()
  } catch (error) {
    logAndThrow('Error fetching git root. Please try using the -R flag.')
    return '.'
  }
}

/**
 *
 * @param {string} projectRoot
 * @returns {string[]}
 */
export function parseGitIgnore(projectRoot: string): string[] {
  const gitIgnorePath = path.join(projectRoot, '.gitignore')
  /** @type {string[]} */
  let lines: string[] = []
  try {
    lines = readAllLines(gitIgnorePath) || []
  } catch (error) {
    logAndThrow(`Unable to open ${gitIgnorePath}: ${error}`)
  }

  return lines.filter(line => {
    if (line === '' || line.startsWith('#')) {
      return false
    }
    return true
  })
}

/**
 *
 * @param {string} projectRoot Root of the project
 * @param {string} dirPath Directory to search in
 * @param {Object} args
 * @param {boolean} [args.verbose]
 * @param {string[]} arrayOfFiles
 * @returns {string[]}
 */
export function getAllFiles(projectRoot: string, dirPath: string, args: UploaderArgs, arrayOfFiles: string[] = []): string[] {
  verbose(`Searching for files in ${dirPath}`, Boolean(args.verbose))
  const files = fs.readdirSync(dirPath)

  files.forEach(function (file) {
    if (isBlacklisted(projectRoot, file, manualBlacklist())) {
      return
    }
    if (fs.lstatSync(path.join(dirPath, file)).isDirectory()) {
      arrayOfFiles = getAllFiles(
        projectRoot,
        path.join(dirPath, file),
        args,
        arrayOfFiles,
      )
    } else {
      arrayOfFiles.push(
        `${path.join(dirPath.replace(projectRoot, '.'), file)}\n`,
      )
    }
  })
  verbose(`Search complete for files in ${dirPath}`, Boolean(args.verbose))
  return arrayOfFiles
}

/**
 *
 * @param {string} filePath
 * @returns {string[]}
 */
export function readAllLines(filePath: string): string[] {
  const fileContents = fs.readFileSync(filePath)

  const lines = fileContents.toString().split('\n') || []
  return lines
}

/**
 *
 * @param {string} projectRoot
 * @param {string} filePath
 * @returns {string}
 */
export function readCoverageFile(projectRoot: string, filePath: string): string {
  try {
    return fs.readFileSync(getFilePath(projectRoot, filePath), {
      encoding: 'utf-8',
    })
  } catch (error) {
    logAndThrow(`There was an error reading the coverage file: ${error}`)
  }
  return ''
}

export function endNetworkMarker() {
  return '<<<<<< network\n'
}

export function endFileMarker() {
  return '<<<<<< EOF\n'
}

/**
 *
 * @param {string} filePath
 * @returns string
 */
export function fileHeader(filePath: string) {
  return `# path=${filePath}\n`
}

export function endEnvironmentMarker() {
  return '<<<<<< ENV\n'
}

/**
 *
 * @param {string} projectRoot
 * @param {string} filePath
 * @returns {string}
 */
export function getFilePath(projectRoot: string, filePath: string): string {
  if (
    filePath.startsWith('./') ||
    filePath.startsWith('/') ||
    filePath.startsWith('.\\') ||
    filePath.startsWith('.\\')
  ) {
    return filePath
  }
  if (projectRoot === '.') {
    return path.join('.', filePath)
  }
  return path.join(projectRoot, filePath)
}

/**
 *
 * @param {string} projectRoot
 * @param {string} filePath
 */
export function removeFile(projectRoot: string, filePath: string) {
  fs.unlink(getFilePath(projectRoot, filePath), err => {
    if (err) {
      logError(`Error removing ${filePath} coverage file`)
    }
  })
}
