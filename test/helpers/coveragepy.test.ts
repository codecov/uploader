import path from 'path'
import childProcess from 'child_process'
import td from 'testdouble'
import { generateCoveragePyFile } from '../../src/helpers/coveragepy'
import * as fileHelpers from '../../src/helpers/files'
import { SPAWNPROCESSBUFFERSIZE } from '../../src/helpers/util'

describe('generateCoveragePyFile()', () => {
    afterEach(() => {
        td.reset()
    })

    it('should run when coveragepy is asked for', async () => {
        const fixturesCoveragePyDir = path.join(
            fileHelpers.fetchGitRoot(),
            'test/fixtures/coveragepy',
        )

        const spawnSync = td.replace(childProcess, 'spawnSync')
        td.when(spawnSync('coverage')).thenReturn({
            stdout: 'coverage installed',
            error: null
        })
        td.when(spawnSync('coverage', td.matchers.contains('xml'), { maxBuffer: SPAWNPROCESSBUFFERSIZE })).thenReturn({
            stdout: 'xml',
            error: null
        })

        expect(await generateCoveragePyFile(fixturesCoveragePyDir, [])).toBe('xml')
    })

    it('should return if a file is provided', async () => {
        const spawnSync = td.replace(childProcess, 'spawnSync')
        td.when(spawnSync('coverage')).thenReturn({
            stdout: 'coverage installed',
            error: null
        })

        const projectRoot = process.cwd()
        expect(await generateCoveragePyFile(projectRoot, ['fakefile'])).toBe('Skipping coveragepy, files already specified')
    })

    it('should return a log when coveragepy is not installed', async () => {
        const spawnSync = td.replace(childProcess, 'spawnSync')
        td.when(spawnSync('coverage')).thenReturn({ error: "command not found: coverage" })

        const projectRoot = process.cwd()
        expect(await generateCoveragePyFile(projectRoot, [])).toBe('coveragepy is not installed')
    })

    it('should return a log when there are no dotcoverage files', async () => {
        const fixturesYamlDir = path.join(
            fileHelpers.fetchGitRoot(),
            'test/fixtures/yaml',
        )

        const spawnSync = td.replace(childProcess, 'spawnSync')
        td.when(spawnSync('coverage')).thenReturn({
            stdout: 'coverage installed',
            error: null
        })

        expect(await generateCoveragePyFile(fixturesYamlDir, [])).toBe('Skipping coveragepy, no .coverage file found.')
    })
})
