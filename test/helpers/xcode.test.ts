import td from 'testdouble'
import childProcess from 'child_process'
import { SPAWNPROCESSBUFFERSIZE } from '../../src/helpers/constants'
import { generateXcodeCoverageFiles } from '../../src/helpers/xcode'

describe('generateXcodeCoverageFiles()', () => {
    afterEach(() => {
        td.reset()
    })

    it('should find all files in fixtures', async () => {
        const spawnSync = td.replace(childProcess, 'spawnSync')
        td.when(spawnSync('xcrun')).thenReturn({
            stdout: Buffer.from('xcrun installed'),
            error: undefined
        })
        td.when(spawnSync('xcrun', td.matchers.contains('--file-list'), { maxBuffer: SPAWNPROCESSBUFFERSIZE })).thenReturn({
            stdout: Buffer.from('../fixtures/xcode/UI/View1.swift'),
            error: undefined
        })
        td.when(spawnSync('xcrun', td.matchers.contains('--file'), { maxBuffer: SPAWNPROCESSBUFFERSIZE })).thenReturn({
            stdout: Buffer.from('  1: *\n  2: 0'),
            error: undefined
        })

        expect(await generateXcodeCoverageFiles('../fixtures/xcode/test.xcresult')).toBe('./coverage-report-test.json')
    })

    it('should return an error when xcode is not installed', async () => {
        const spawnSync = td.replace(childProcess, 'spawnSync')
        td.when(spawnSync('xcrun')).thenReturn({ error: new Error("Command 'xcrun' not found") })

        await expect(generateXcodeCoverageFiles('')).rejects.toThrowError(/xcrun is not installed/)
    })
})
