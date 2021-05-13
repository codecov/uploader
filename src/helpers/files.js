const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')
const glob = require('glob')

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

function getCoverageFiles (projectRoot, coverageFilePatterns) {
  let files = []
  for (let index = 0; index < coverageFilePatterns.length; index++) {
    const pattern = coverageFilePatterns[index]
    const newFiles = glob.sync(`**/${pattern}`, {
      cwd: projectRoot,
      ignore: globBlacklist()
    })

    files = files.concat(newFiles)
  }
  return files
}

function isBlacklisted (projectRoot, file, manualBlacklist) {
  const blacklist = manualBlacklist
  return blacklist.includes(file)
}

function fetchGitRoot () {
  try {
    return (
      childProcess
        .spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf-8' })
        .stdout ||
      childProcess
        .spawnSync('hg', ['root'], { encoding: 'utf-8' })
        .stdout ||
      process.cwd()
    ).trimRight()
  } catch (error) {
    throw new Error('Error fetching git root. Please try using the -R flag.')
  }
}

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

function getAllFiles (projectRoot, dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath)
  arrayOfFiles = arrayOfFiles || []

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

function readAllLines (filePath) {
  const fileContents = fs.readFileSync(filePath)

  const lines = fileContents.toString().split('\n') || []
  return lines
}

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
