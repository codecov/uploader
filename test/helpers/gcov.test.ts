
import td from 'testdouble'
import childProcess from 'child_process'
import { generateGcovCoverageFiles } from '../../src/helpers/gcov'

describe('generateGcovCoverageFiles()', () => {
    afterEach(() => {
        td.reset()
    })

    it('should find and run on test/fixtures/gcov/main.gcno', () => {
        const projectRoot = process.cwd()
        expect(generateGcovCoverageFiles(projectRoot)).toBe(`File 'main.c'
Lines executed:0.00% of 11
Branches executed:0.00% of 4
Taken at least once:0.00% of 4
Calls executed:0.00% of 5
Creating 'main.c.gcov'

Lines executed:0.00% of 11`)
    })
    it('should find no gcno files and return an error', () => {
        const projectRoot = process.cwd()
        expect(() => { generateGcovCoverageFiles(projectRoot, [], ['test']) }).toThrowError(/No gcov files found/)


    })

    it('should pass gcov arguments directly through', () => {
        const spawnSync = td.replace(childProcess, 'spawnSync')
        td.when(spawnSync('gcov')).thenReturn({
            stdout: 'gcov installed',
            error: null
        })
        td.when(spawnSync('gcov', td.matchers.contains('NEWGCOVARG'))).thenReturn({
            stdout: 'Matched',
        })

        const projectRoot = process.cwd()
        expect(generateGcovCoverageFiles(projectRoot, [], [], 'NEWGCOVARG')).toEqual("Matched")
    })

    it('should return an error when gcov is not installed', () => {
        const spawnSync = td.replace(childProcess, 'spawnSync')
        td.when(spawnSync('gcov')).thenReturn({ error: "Command 'gcov' not found" })

        const projectRoot = process.cwd()
        expect(() => generateGcovCoverageFiles(projectRoot, [], [], 'NEWGCOVARG')).toThrowError(/gcov is not installed/)
    })
})
