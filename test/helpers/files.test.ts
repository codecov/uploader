import td from 'testdouble'
import fs from 'fs'
import childProcess from 'child_process'
import * as fileHelpers from '../../src/helpers/files'
import mock from 'mock-fs'

describe('File Helpers', () => {
  afterEach(() => {
    td.reset()
    mock.restore()
  })

  it('provides network end marker', () => {
    expect(fileHelpers.MARKER_NETWORK_END).toBe('<<<<<< network\n')
  })

  it('provides file end marker', () => {
    expect(fileHelpers.MARKER_FILE_END).toBe('<<<<<< EOF\n')
  })

  it('provides env end marker', () => {
    expect(fileHelpers.MARKER_ENV_END).toBe('<<<<<< ENV\n')
  })

  it('can fetch the git root', () => {
    const cwd = td.replace(process, 'cwd')
    const spawnSync = td.replace(childProcess, 'spawnSync')
    td.when(cwd()).thenReturn({ stdout: 'fish' })
    td.when(
      spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf-8' }),
    ).thenReturn({ stdout: 'gitRoot' })

    expect(fileHelpers.fetchGitRoot()).toBe('gitRoot')
  })

  it('errors when it cannot fetch the git root', () => {
    const cwd = td.replace(process, 'cwd')
    td.replace(childProcess, 'spawnSync')
    td.when(cwd()).thenReturn({ stdout: 'fish' })
    expect(() => {
      fileHelpers.fetchGitRoot()
    }).toThrow()
  })

  it('can get a file listing', async () => {
    expect(
      await fileHelpers.getFileListing('.', { flags: '', verbose: 'true' }),
    ).toMatch('npm-shrinkwrap.json')
  })

  it('can parse the .gitignore file', () => {
    const readFileSync = td.replace(fs, 'readFileSync')
    td.when(readFileSync('.gitignore')).thenReturn(
      'ignore this file\nandthisone\n# not me!\n\nand me',
    )
    expect(fileHelpers.parseGitIgnore('.')).toStrictEqual([
      'ignore this file',
      'andthisone',
      'and me',
    ])
  })

  it('throws error when cannot parse the .gitignore file', () => {
    td.replace(fs, 'readFileSync')
    expect(() => {
      fileHelpers.parseGitIgnore('.')
    }).toThrow()
  })

  describe('Coverage report handling', () => {
    it('can generate report file header', () => {
      expect(fileHelpers.fileHeader('test-coverage-file.xml')).toBe(
        '# path=test-coverage-file.xml\n',
      )
    })
    it('can read a coverage report file', async () => {

      mock({
        'test-coverage-file.xml': 'I am test coverage data'
      })

      const reportContents = await fileHelpers.readCoverageFile(
        '.',
        'test-coverage-file.xml',
      )
      expect(reportContents).toBe('I am test coverage data')
    })

    it('can return a list of coverage files', async () => {
      const results = await fileHelpers.getCoverageFiles(
        '.',
        fileHelpers.coverageFilePatterns(),
      )

      expect(results).not.toContain('dummy.codecov.exe')

      expect(results).not.toContain('codecov.exe')

      expect(results).toContain('test/fixtures/other/fake.codecov.txt')
    })

    it('can return a list of coverage files with a pattern', async () => {
      expect(
        await fileHelpers.getCoverageFiles('.', ['index.test.ts']),
      ).toStrictEqual(['test/index.test.ts', 'test/providers/index.test.ts'])
    })
    describe('coverage file patterns', () => {
      it('contains `jacoco*.xml`', () => {
        expect(fileHelpers.coverageFilePatterns()).toContain('jacoco*.xml')
      })
    })
    describe('file exists', () => {
      it('returns true if file exists', () => {
        expect(fileHelpers.fileExists('', 'test/fixtures/coverage.txt'))
      })
      it('returns false if file doesnt exist', () => {
        expect(fileHelpers.fileExists('', 'test/fake/path/to/file.txt'))
      })
      it('returns true if file exists in a directory', () => {
        expect(fileHelpers.fileExists('test/fixtures', 'coverage.txt'))
      })
    })
    describe('getFilePath()', () => {
      it('should return path when file path has no starting slash', () => {
        expect(fileHelpers.getFilePath('/usr/', 'coverage.xml')).toEqual(
          '/usr/coverage.xml',
        )
      })
      it('should return path when file path has no starting slash', () => {
        expect(fileHelpers.getFilePath('/usr', 'coverage.xml')).toEqual(
          '/usr/coverage.xml',
        )
      })
      it('should return path when file path starts with a ./', () => {
        expect(fileHelpers.getFilePath('/usr/', './coverage.xml')).toEqual(
          './coverage.xml',
        )
      })
      it('should return path when project root is . and filepath does not start with ./ or /', () => {
        expect(fileHelpers.getFilePath('.', 'coverage.xml')).toEqual(
          'coverage.xml',
        )
      })
      it('should return path when project root is . and filepath starts /', () => {
        expect(fileHelpers.getFilePath('.', '/usr/coverage.xml')).toEqual(
          '/usr/coverage.xml',
        )
      })
    })
  })

  it('can remove a file', () => {
    const fn = jest.spyOn(fs, 'unlink').mockImplementation(() => null)
    fileHelpers.removeFile('.', 'coverage.xml')
    expect(fn).toHaveBeenCalledWith('coverage.xml', expect.any(Function))
  })
})
