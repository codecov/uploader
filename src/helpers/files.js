// @ts-check
const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')
const glob = require('glob')

/**
 *
 * @param {string} projectRoot
 * @returns Promise<string>
 */
async function getFileListing (projectRoot) {
  return getAllFiles(projectRoot, projectRoot).join('')
}

function manualBlacklist () {
  // TODO: honor the .gitignore file instead of a hard-coded list
  return [
    'node_modules',
    '.git',
    '.nyc_output',
    '.circleci',
    '.nvmrc',
    '.gitignore'
  ]
}

function globBlacklist () {
  // TODO: honor the .gitignore file instead of a hard-coded list
  return [
    'node_modules/**/*',
    '.git',
    '.nyc_output',
    '.circleci',
    '.nvmrc',
    '.gitignore'
  ]
}

function coverageFilePatterns () {
  return [
    '*coverage*.*',
    'nosetests.xml',
    'jacoco*.xml',
    'clover.xml',
    'report.xml',
    '*.codecov.*',
    'codecov.*',
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
    '*.lst'
  ]
}

/**
 *
 * @param {string} projectRoot
 * @param {string[]} coverageFilePatterns
 * @returns string[]
 */
function getCoverageFiles (projectRoot, coverageFilePatterns) {
  const files = coverageFilePatterns.flatMap(pattern => {
    return glob.sync(`**/${pattern}`, {
      cwd: projectRoot,
      ignore: globBlacklist()
    })
  })
  return files
}

/**
 *
 * @param {string} projectRoot
 * @param {string} file
 * @param {string[]} manualBlacklist
 * @returns boolean
 */
function isBlacklisted (projectRoot, file, manualBlacklist) {
  const blacklist = manualBlacklist
  return blacklist.includes(file)
}

function fetchGitRoot () {
  try {
    return (
      childProcess
        .spawnSync('git', ['rev-parse', '--show-toplevel'])
        .stdout.toString()
        .trimRight() ||
      childProcess
        .spawnSync('hg', ['root'])
        .stdout.toString()
        .trimRight() ||
      process.cwd()
    )
  } catch (error) {
    throw new Error('Error fetching git root. Please try using the -R flag.')
  }
}

/**
 *
 * @param {string} projectRoot
 * @returns string[]
 */
function parseGitIgnore (projectRoot) {
  const gitIgnorePath = path.join(projectRoot, '.gitignore')
  let lines
  try {
    lines = readAllLines(gitIgnorePath) || []
  } catch (error) {
    throw new Error(`Unable to open ${gitIgnorePath}: ${error}`)
  }

  const filteredLines = lines.filter(line => {
    if (line === '' || line.startsWith('#')) {
      return false
    }
    return true
  })
  return filteredLines
}

/**
 *
 * @param {string} projectRoot Root of the project
 * @param {string} dirPath Directory to search in
 * @param {string[]} arrayOfFiles
 * @returns {string[]}
 */
function getAllFiles (projectRoot, dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath)

  files.forEach(function (file) {
    if (
      fs.statSync(path.join(dirPath, file)).isDirectory() &&
      !isBlacklisted(projectRoot, file, manualBlacklist())
    ) {
      arrayOfFiles = getAllFiles(
        projectRoot,
        path.join(dirPath, file),
        arrayOfFiles
      )
    } else {
      if (!isBlacklisted(projectRoot, file, manualBlacklist())) {
        arrayOfFiles.push(
          `${path.join(dirPath.replace(projectRoot, '.'), file)}\n`
        )
      }
    }
  })

  return arrayOfFiles
}

/**
 *
 * @param {string} filePath
 * @returns string[]
 */
function readAllLines (filePath) {
  const fileContents = fs.readFileSync(filePath)

  const lines = fileContents.toString().split('\n') || []
  return lines
}

/**
 *
 * @param {string} projectRoot
 * @param {string} filePath
 * @returns string
 */
function readCoverageFile (projectRoot, filePath) {
  try {
    return fs.readFileSync(getFilePath(projectRoot, filePath))
  } catch (error) {
    throw new Error(`There was an error reading the coverage file: ${error}`)
  }
}

function endNetworkMarker () {
  return '<<<<<< network\n'
}

function endFileMarker () {
  return '<<<<<< EOF\n'
}

function fileHeader (filePath) {
  return `# path=${filePath}\n`
}

function endEnvironmentMarker () {
  return '<<<<<< ENV\n'
}

/**
 *
 * @param {string} projectRoot
 * @param {string} filePath
 * @returns string
 */
function getFilePath (projectRoot, filePath) {
  if (filePath.startsWith('./') ||
      filePath.startsWith('/') ||
      filePath.startsWith('.\\') ||
      filePath.startsWith('.\\')) {
    return filePath
  }
  if (projectRoot === '.') {
    return path.join('.', filePath)
  }
  return path.join(projectRoot, filePath)
}

module.exports = {
  readCoverageFile,
  getFileListing,
  endFileMarker,
  endNetworkMarker,
  endEnvironmentMarker,
  fileHeader,
  fetchGitRoot,
  parseGitIgnore,
  getCoverageFiles,
  coverageFilePatterns,
  getFilePath
}
