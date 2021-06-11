const { afterEach, describe, it } = require('@jest/globals')
const childProcess = require('child_process')
const mock  = require('mock-fs')
const fileHelpers = require('../../src/helpers/files')
const fs = require('fs')
const td = require('testdouble')

describe('File Helpers', () => {
  afterEach(function () {
    td.reset()
    mock.restore()
  })

  it('can generate network end marker', () => {
    expect(fileHelpers.endNetworkMarker()).toBe('<<<<<< network\n')
  })

  it('can generate file end marker', () => {
    expect(fileHelpers.endFileMarker()).toBe('<<<<<< EOF\n')
  })

  it('can fetch the git root', function () {
    const spawnSync = td.replace(childProcess, 'spawnSync')
    td.when(spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding:'utf-8' })).thenReturn({ stdout: 'gitRoot' })

    expect(fileHelpers.fetchGitRoot()).toBe('gitRoot')
  })

  it('errors when it cannot fetch the git root', function () {
    const spawnSync = td.replace(childProcess, 'spawnSync')
    expect(() => { fileHelpers.fetchGitRoot() }).toThrow()
  })

  it('can get a file listing', async () => {
    mock({
      'coverFile1.txt': ''
    })
    expect(await fileHelpers.getFileListing('.')).toMatch(
      'coverFile1.txt'
    )
  })

  it('can get a file listing with the project root replaced', async () => {
    mock({
      '/beatlejuice': {
        'testDir': {
          'coverFile.txt': ''
        }
      },
      'C:': {
        'Users': {
          'circleci': {
            'project': {
              'test': {
                'helpers': {
                  'files.test.js': ''
                }
              }
            }
          }
        }
      }
    })
    expect(await fileHelpers.getFileListing('/beatlejuice')).toMatch(
      'testDir/coverFile.txt'
    )

    expect(await fileHelpers.getFileListing('C:/Users/circleci/project')).toMatch(
      'test/helpers/files.test.js'
    )
  })

  it('can parse the .gitignore file', function () {
    mock({
      '/testDir/': {}
    })
    const readFileSync = td.replace(fs, 'readFileSync')
    td.when(readFileSync('.gitignore')).thenReturn('ignore this file\nandthisone\n# not me!\n\nand me')
    expect(fileHelpers.parseGitIgnore('.')).toStrictEqual(['ignore this file', 'andthisone', 'and me'])
  })

  it('throws error when cannot parse the .gitignore file', function () {
    mock({
      '/testDir/': {}
    })
    const readFileSync = td.replace(fs, 'readFileSync')
    expect(() => { fileHelpers.parseGitIgnore('.') }).toThrow()
  })

  describe('Coverage report handling', () => {
    it('can generate report file header', () => {
      mock({
        '/testDir/': {}
      })
      expect(fileHelpers.fileHeader('test-coverage-file.xml')).toBe(
        '# path=test-coverage-file.xml\n'
      )
    })
    it('can read a coverage report file', async () => {
      mock({
        '/testDir/': {}
      })
      const readFileSync = td.replace(fs, 'readFileSync')
      td.when(readFileSync('test-coverage-file.xml', { encoding:'utf-8' })).thenReturn('I am test coverage data')
      const reportContents = fileHelpers.readCoverageFile(
        '.',
        'test-coverage-file.xml'
      )
      expect(reportContents).toBe('I am test coverage data')
    })

    it('can return a list of coverage files', () => {
      mock({
        'testDir': {
          'index.a.test.js': '',
          'cobertura.xml': '',
          'codecov.exe': '',
          'codecov.lcov': ''
        },
        'cobertura.xml': ''
      })
      const results = fileHelpers.getCoverageFiles('.', fileHelpers.coverageFilePatterns())

      expect(results).toContain(
        'testDir/codecov.lcov'
      )

      expect(results).not.toContain(
        'codecov.exe'
      )

      expect(results).toContain(
        'cobertura.xml'
      )
    })

    it('can return a list of coverage files with a pattern', () => {
      mock({
        'testDir': {
          'index.a.test.js': '',
          'index.b.test.js': '',
          'index.v.test.ts': ''
        }
      })
      expect(
        fileHelpers.getCoverageFiles('.', ['*.test.js'])
      ).toStrictEqual(['testDir/index.a.test.js', 'testDir/index.b.test.js'])
    })

    describe('coverage file patterns', function () {
      it('contains `jacoco*.xml`', function () {
        expect(fileHelpers.coverageFilePatterns()).toContain('jacoco*.xml')
      })
    })

    describe('getFilePath()', () => {
      it('should return path when file path has no starting slash', () => {
        expect(fileHelpers.getFilePath('/usr/', 'coverage.xml')).toEqual('/usr/coverage.xml')
      })

      it('should return path when file path has no starting slash', () => {
        expect(fileHelpers.getFilePath('/usr', 'coverage.xml')).toEqual('/usr/coverage.xml')
      })

      it('should return path when file path starts with a ./', () => {
        expect(fileHelpers.getFilePath('/usr/', './coverage.xml')).toEqual('./coverage.xml')
      })

      it('should return path when project root is . and filepath does not start with ./ or /', () => {
        expect(fileHelpers.getFilePath('.', 'coverage.xml')).toEqual('coverage.xml')
      })

      it('should return path when project root is . and filepath starts /', () => {
        expect(fileHelpers.getFilePath('.', '/usr/coverage.xml')).toEqual('/usr/coverage.xml')
      })
    })
  })

  it('can remove a file', function () {
    const fn = jest.spyOn(fs, 'unlink').mockImplementation(() => null)
    fileHelpers.removeFile('.', 'coverage.xml')
    expect(fn).toHaveBeenCalledWith('coverage.xml', expect.any(Function))
  })
})
