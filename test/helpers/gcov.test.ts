
import td from 'testdouble'
import childProcess from 'child_process'
import { generateGcovCoverageFiles } from '../../src/helpers/gcov'
import { SPAWNPROCESSBUFFERSIZE } from '../../src/helpers/util'

describe('generateGcovCoverageFiles()', () => {
    afterEach(() => {
        td.reset()
    })

    it('should find and run on test/fixtures/gcov/main.gcno', async () => {
        const output = `File 'main.c'\nLines executed:0.00% of 11\nBranches executed:0.00% of 4\nTaken at least once:0.00% of 4\nCalls executed:0.00% of 5\nCreating 'main.c.gcov'\n\nLines executed:0.00% of 11`
        const spawnSync = td.replace(childProcess, 'spawnSync')
        td.when(spawnSync('gcov')).thenReturn({
            stdout: 'gcov installed',
            error: null
        })
        td.when(spawnSync('gcov', td.matchers.contains('test/fixtures/gcov/main.gcno'), { maxBuffer: SPAWNPROCESSBUFFERSIZE })).thenReturn({
            stdout: output,
            error: null
        })
        const projectRoot = process.cwd()
        expect(await generateGcovCoverageFiles(projectRoot)).toBe(output)
    })

    it('should pass gcov arguments directly through', async () => {
        const spawnSync = td.replace(childProcess, 'spawnSync')
        td.when(spawnSync('gcov')).thenReturn({
            stdout: 'gcov installed',
            error: null
        })
        td.when(spawnSync('gcov', td.matchers.contains('NEWGCOVARG'), { maxBuffer: SPAWNPROCESSBUFFERSIZE })).thenReturn({
            stdout: 'Matched',
        })

        const projectRoot = process.cwd()
        expect(await generateGcovCoverageFiles(projectRoot, [], [], ['NEWGCOVARG'], 'gcov')).toEqual("Matched")
    })

    it('should return an error when no gcno files found', async () => {
        const spawnSync = td.replace(childProcess, 'spawnSync')
        td.when(spawnSync('gcov')).thenReturn({
            stdout: 'gcov installed',
            error: null
        })
        td.when(spawnSync('gcov', td.matchers.contains('test'))).thenReturn({
            stdout: 'No executable lines'
        })
        const projectRoot = process.cwd()
        await expect(generateGcovCoverageFiles(projectRoot, [], ['test'])).rejects.toThrowError(/No gcov files found/)


    })

    it('should return an error when gcov is not installed', async () => {
        const spawnSync = td.replace(childProcess, 'spawnSync')
        td.when(spawnSync('gcov')).thenReturn({ error: "Command 'gcov' not found" })

        const projectRoot = process.cwd()
        await expect(generateGcovCoverageFiles(projectRoot, [], [], ['NEWGCOVARG'], 'gcov')).rejects.toThrowError(/gcov is not installed/)
    })
})
