import childProcess from 'child_process'
import glob from 'fast-glob'
import fs from 'fs'
import { readFile } from 'fs/promises'
import { posix as path } from 'path'
import { UploaderArgs } from '../types'
import { getEntries } from './ignoreListManager'
import { logError, verbose } from './logger'

export const MARKER_NETWORK_END = '<<<<<< network\n'
export const MARKER_FILE_END = '<<<<<< EOF\n'
export const MARKER_ENV_END = '<<<<<< ENV\n'

/**
 *
 * @param {string} projectRoot
 * @param {Object} args
 * @returns {Promise<string>}
 */
export async function getFileListing(
  projectRoot: string,
  args: UploaderArgs,
): Promise<string> {
  return getAllFiles(projectRoot, projectRoot, args).join('')
}

export function coverageFilePatterns(): string[] {
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
export async function getCoverageFiles(
  projectRoot: string,
  coverageFilePatterns: string[],
): Promise<string[]> {
  const globstar = (pattern: string) => `**/${pattern}`

  return glob(coverageFilePatterns.map(globstar), {
    cwd: projectRoot,
    ignore: getEntries(),
  })
}

export function fetchGitRoot(): string {
  try {
    return (
      childProcess.spawnSync('git', ['rev-parse', '--show-toplevel'], {
        encoding: 'utf-8',
      }).stdout || process.cwd()
    ).trimRight()
  } catch (error) {
    throw new Error('Error fetching git root. Please try using the -R flag.')
  }
}

/**
 * Read a .gitignore file and strip comments
 * @param {string} gitIgnorePath  - full path to .gitignore file
 * @returns {string[]}
 */
export function parseGitIgnore(gitIgnorePath : string): string[] {
  /** @type {string[]} */
  let lines: string[] = []
  try {
    lines = readAllLines(gitIgnorePath) || []
  } catch (error) {
    throw new Error(`Unable to open ${gitIgnorePath}: ${error}`)
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
 * @returns {string[]}
 */
export function getAllFiles(
  projectRoot: string,
  dirPath: string,
  args: UploaderArgs,
): string[] {
  verbose(`Searching for files in ${dirPath}`, Boolean(args.verbose))

  return glob
    .sync(['**/*', '**/.[!.]*'], {
      cwd: projectRoot,
      ignore: getEntries(),
    })
    .map(file => `${file}\n`)
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
export async function readCoverageFile(
  projectRoot: string,
  filePath: string,
): Promise<string> {
  return readFile(getFilePath(projectRoot, filePath), {
    encoding: 'utf-8',
  }).catch(err => {
    throw new Error(`There was an error reading the coverage file: ${err}`)
  })
}

/**
 *
 * @param {string} projectRoot
 * @param {string} filePath
 * @returns boolean
 */
export function fileExists(projectRoot: string, filePath: string): boolean {
  return fs.existsSync(getFilePath(projectRoot, filePath))
}

/**
 *
 * @param {string} filePath
 * @returns string
 */
export function fileHeader(filePath: string): string {
  return `# path=${filePath}\n`
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
export function removeFile(projectRoot: string, filePath: string): void {
  fs.unlink(getFilePath(projectRoot, filePath), err => {
    if (err) {
      logError(`Error removing ${filePath} coverage file`)
    }
  })
}
