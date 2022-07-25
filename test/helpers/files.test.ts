import td from 'testdouble'
import fs from 'fs'
import childProcess from 'child_process'
import * as fileHelpers from '../../src/helpers/files'
import { getBlocklist } from '../../src/helpers/files'
import { SPAWNPROCESSBUFFERSIZE } from '../../src/helpers/util'
import mock from 'mock-fs'

describe('File Helpers', () => {
  afterEach(() => {
    td.reset()
    mock.restore()
  })

  it('provides network end marker', () => {
    expect(fileHelpers.MARKER_NETWORK_END).toBe('\n<<<<<< network\n')
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
      spawnSync('git', ['rev-parse', '--show-toplevel'], { maxBuffer: SPAWNPROCESSBUFFERSIZE }),
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
    const files = ['npm-shrinkwrap.json', 'package.json']
    td.replace(childProcess, 'spawnSync', () => {
      return {
        stdout: files.join('\n'),
        status: 0,
        error: undefined,
      }
    })
    expect(
      await fileHelpers.getFileListing('.', { flags: '', verbose: 'true', slug: '',upstream: '' }),
    ).toBe(files.join('\n'))
  })

  it('can get a file listing with a file filter', async () => {
    const files = ['npm-shrinkwrap.json', 'package.json', 'package-lock.json', 'src/file.js']
    td.replace(childProcess, 'spawnSync', () => {
      return {
        stdout: files.join('\n'),
        status: 0,
        error: undefined,
      }
    })
    expect(
      await fileHelpers.getFileListing('.', {
        flags: '',
        networkFilter: 'package',
        verbose: 'true',
        slug: '',
        upstream: '',
      }),
    ).toBe(['package.json', 'package-lock.json'].join('\n'))
  })

  it('can get a file listing with a dir filter', async () => {
    const files = ['npm-shrinkwrap.json', 'package.json', 'src/file.js']
    td.replace(childProcess, 'spawnSync', () => {
      return {
        stdout: files.join('\n'),
        status: 0,
        error: undefined,
      }
    })
    expect(
      await fileHelpers.getFileListing('.', {
        flags: '',
        networkFilter: 'src/',
        verbose: 'true',
        slug: '',
        upstream: '',
      }),
    ).toBe(['src/file.js'].join('\n'))
  })

  it('can get a file listing when git is unavailable', async () => {
    td.replace(childProcess, 'spawnSync', () => {
      return { stdout: '', status: null, error: new Error() }
    })
    expect(
      await fileHelpers.getFileListing('.', {
        flags: '',
        verbose: 'true',
        slug: '',
        upstream: '',
      }),
    ).toMatch('npm-shrinkwrap.json')
  })

  it('can get a file listing with a file filter and prefix', async () => {
    const files = ['npm-shrinkwrap.json', 'package.json', 'package-lock.json', 'src/file.js']
    td.replace(childProcess, 'spawnSync', () => {
      return {
        stdout: files.join('\n'),
        status: 0,
        error: undefined,
      }
    })
    expect(
      await fileHelpers.getFileListing('.', {
        flags: '',
        networkFilter: 'package',
        networkPrefix: 'build/',
        verbose: 'true',
        slug: '',
        upstream: '',
      }),
    ).toBe(['build/package.json', 'build/package-lock.json'].join('\n'))
  })

  it('can get a file listing with a dir filter and prefix', async () => {
    const files = ['npm-shrinkwrap.json', 'package.json', 'src/file.js']
    td.replace(childProcess, 'spawnSync', () => {
      return {
        stdout: files.join('\n'),
        status: 0,
        error: undefined,
      }
    })
    expect(
      await fileHelpers.getFileListing('.', {
        flags: '',
        networkFilter: 'src/',
        networkPrefix: 'build/',
        verbose: 'true',
        slug: '',
        upstream: '',
      }),
    ).toBe(['build/src/file.js'].join('\n'))
  })

  it('can get a file listing when git is unavailable with a filter', async () => {
    td.replace(childProcess, 'spawnSync', () => {
      return { stdout: '', status: null, error: new Error() }
    })
    expect(
      await fileHelpers.getFileListing('.', {
        flags: '',
        networkFilter: 'npm',
        verbose: 'true',
        slug: '',
        upstream: '',
      }),
    ).toMatch('npm-shrinkwrap.json')
  })

  it('can get a file listing when git is unavailable with a filter without matches', async () => {
    td.replace(childProcess, 'spawnSync', () => {
      return { stdout: '', status: null, error: new Error() }
    })
    expect(
      await fileHelpers.getFileListing('.', {
        flags: '',
        networkFilter: 'src',
        verbose: 'true',
        slug: '',
        upstream: '',
      }),
    ).toMatch('')
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

    it('throws when unable to read a coverage file', async () => {

      mock({
        'test-coverage-file.xml': 'I am test coverage data'
      })

      await expect(fileHelpers.readCoverageFile(
        '.',
        'test-no-coverage-file.xml',
      )).rejects.toThrowError(/no such file or directory/)
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
        await fileHelpers.getCoverageFiles('.', ['coverage.txt']),
      ).toStrictEqual(['test/fixtures/coverage.txt', 'test/fixtures/other/coverage.txt'])
    })
    it('can return a list of coverage files with a negated pattern', async () => {
      expect(
        await fileHelpers.getCoverageFiles('.', ['coverage.txt', '!test/fixtures/other']),
      ).toStrictEqual(['test/fixtures/coverage.txt'])
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

  describe("filterFilesAgainstBlockList()", () => {
    const getPaths = () => fileHelpers.getCoverageFiles(
      '.',
      fileHelpers.coverageFilePatterns(),
    )
    it("works", async () => {
      const paths = await getPaths()

      expect(() => fileHelpers.filterFilesAgainstBlockList(paths, getBlocklist())).not.toThrow()
    })

    it("returns the input array when passed an empty ignore array", async () => {
      const paths = await getPaths()
      expect(fileHelpers.filterFilesAgainstBlockList(paths, [])).toEqual(paths)
    })

    it("ignores an ignore filename", async () => {
      expect(fileHelpers.filterFilesAgainstBlockList(await getPaths(), ["coverage-summary.json"])).not.toContain(expect.stringContaining('coverage-summary.json'))
    })

    it("ignores an ignore filename glob", async () => {
      const foo = expect(fileHelpers.filterFilesAgainstBlockList(await getPaths(), ["**/coverage*"])).not.toContainEqual(expect.stringMatching('/coverage'))
      console.log(foo)
    })

    it("ignores an ignore filename globstar", async () => {
      expect(fileHelpers.filterFilesAgainstBlockList(await getPaths(), ["**/other/*"])).not.toContainEqual(expect.stringMatching('other'))
    })

    it("ignores shell scripts by default", async () => {
      expect(fileHelpers.filterFilesAgainstBlockList(await getPaths(), getBlocklist())).not.toContainEqual(expect.stringMatching('codecov.sh'))
    })

    it("should ignore files ending with *.*js", async () => {
      expect(fileHelpers.filterFilesAgainstBlockList(await getPaths(), getBlocklist())).not.toContainEqual(expect.stringMatching('coverage.cjs'))
      expect(fileHelpers.filterFilesAgainstBlockList(await getPaths(), getBlocklist())).not.toContainEqual(expect.stringMatching('coverage.mjs'))
    })

    it("should ignore files ending with *.js", async () => {
      expect(fileHelpers.filterFilesAgainstBlockList(await getPaths(), getBlocklist())).not.toContainEqual(expect.stringMatching('coverage.js'))
    })

    it("ignores powershell scripts by default", async () => {
      expect(fileHelpers.filterFilesAgainstBlockList(await getPaths(), getBlocklist())).not.toContainEqual(expect.stringMatching('codecov.ps1'))
    })
    it("ignores codecov configs by default", async () => {
      expect(fileHelpers.filterFilesAgainstBlockList(await getPaths(), getBlocklist())).not.toContainEqual(expect.stringMatching(/^\.?codecov\.ya?ml/))
    })

    it.each([
      "coverage.info",
      "coverage.opencover.xml",
      "gap-coverage.json",
    ])("includes %s", (file) => {
      expect(fileHelpers.filterFilesAgainstBlockList([file], getBlocklist()))
        .toContainEqual(expect.stringMatching(file))
    })
  })

  it('can remove a file', () => {
    const fn = jest.spyOn(fs, 'unlink').mockImplementation(() => null)
    fileHelpers.removeFile('.', 'coverage.xml')
    expect(fn).toHaveBeenCalledWith('coverage.xml', expect.any(Function))
  })
})
