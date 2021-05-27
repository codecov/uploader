const { afterEach, describe, it } = require('@jest/globals')

const td = require('testdouble')
const fs = require('fs')
const childProcess = require('child_process')
const fileHelpers = require('../../src/helpers/files')

describe('File Helpers', () => {
  afterEach(function () {
    td.reset()
  })

  it('can generate network end marker', () => {
    expect(fileHelpers.endNetworkMarker()).toBe('<<<<<< network\n')
  })

  it('can generate file end marker', () => {
    expect(fileHelpers.endFileMarker()).toBe('<<<<<< EOF\n')
  })

  it('can fetch the git root', function () {
    const cwd = td.replace(process, 'cwd')
    const spawnSync = td.replace(childProcess, 'spawnSync')
    td.when(cwd()).thenReturn({ stdout: 'fish' })
    td.when(spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding:'utf-8' })).thenReturn({ stdout: 'gitRoot' })

    expect(fileHelpers.fetchGitRoot()).toBe('gitRoot')
  })

  it('can get a file listing', async () => {
    expect(await fileHelpers.getFileListing('.')).toMatch(
      'npm-shrinkwrap.json'
    )
  })

  it('can parse the .gitignore file', function () {
    const readFileSync = td.replace(fs, 'readFileSync')
    td.when(readFileSync('.gitignore')).thenReturn('ignore this file\nandthisone\n# not me!\n\nand me')
    expect(fileHelpers.parseGitIgnore('.')).toStrictEqual(['ignore this file', 'andthisone', 'and me'])
  })

  describe('Coverage report handling', () => {
    it('can generate report file header', () => {
      expect(fileHelpers.fileHeader('test-coverage-file.xml')).toBe(
        '# path=test-coverage-file.xml\n'
      )
    })
    it('can read a coverage report file', async () => {
      const readFileSync = td.replace(fs, 'readFileSync')
      td.when(readFileSync('test-coverage-file.xml', { encoding:'utf-8' })).thenReturn('I am test coverage data')
      const reportContents = fileHelpers.readCoverageFile(
        '.',
        'test-coverage-file.xml'
      )
      expect(reportContents).toBe('I am test coverage data')
    })
    it('can return a list of coverage files', () => {
      expect(
        fileHelpers.getCoverageFiles('.', ['index.test.js'])
      ).toStrictEqual(['test/index.test.js', 'test/providers/index.test.js'])
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
