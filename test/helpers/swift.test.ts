import td from 'testdouble'
import childProcess from 'child_process'

import * as fsPromise from 'fs/promises'
import os from 'os'
import { SPAWNPROCESSBUFFERSIZE } from '../../src/helpers/constants'
import { generateSwiftCoverageFiles } from '../../src/helpers/swift'

describe('generateSwiftCoverageFiles()', () => {
    afterEach(() => {
        jest.clearAllMocks()
        td.reset()
    })

    it('should convert all files without a project given', async () => {
        const homedir = td.replace(os, 'homedir')
        td.when(homedir()).thenReturn('test/fixtures/')
        expect(os.homedir()).toBe('test/fixtures/')

        const spawnSync = td.replace(childProcess, 'spawnSync')
        td.when(spawnSync('xcrun')).thenReturn({
            stdout: 'xcrun installed',
            error: null
        })
        td.when(spawnSync('xcrun', td.matchers.contains('llvm-cov'), { maxBuffer: SPAWNPROCESSBUFFERSIZE })).thenReturn({
            stdout: '',
            error: null
        })

        expect(await generateSwiftCoverageFiles('')).toEqual([
           'Project.app.coverage.txt',
           'Project2.xctest.coverage.txt'
        ])
        expect(console.log).toHaveBeenCalledWith(
            expect.stringMatching(/Found 2 profdata files:/),
        )
        expect(console.log).toHaveBeenCalledWith(
            expect.stringMatching(/ {2}\+ Building reports for Project app/),
        )
        expect(console.log).toHaveBeenCalledWith(
            expect.stringMatching(/ {2}\+ Building reports for Project2 xctest/),
        )
    })

    it('should convert all files with a project given', async () => {
        const homedir = td.replace(os, 'homedir')
        td.when(homedir()).thenReturn('test/fixtures/')
        expect(os.homedir()).toBe('test/fixtures/')

        const spawnSync = td.replace(childProcess, 'spawnSync')
        td.when(spawnSync('xcrun')).thenReturn({
            stdout: 'xcrun installed',
            error: null
        })
        td.when(spawnSync('xcrun', td.matchers.contains('llvm-cov'), { maxBuffer: SPAWNPROCESSBUFFERSIZE })).thenReturn({
            stdout: '',
            error: null
        })

        expect(await generateSwiftCoverageFiles('Project')).toEqual([
           'Project.app.coverage.txt',
        ])
        expect(console.log).toHaveBeenCalledWith(
            expect.stringMatching(/Found 2 profdata files:/),
        )
        expect(console.log).toHaveBeenCalledWith(
            expect.stringMatching(/ {2}\+ Building reports for Project app/),
        )
        expect(console.log).not.toHaveBeenCalledWith(
            expect.stringMatching(/ {2}\+ Building reports for Project2 xctest/),
        )
    })

    it('should convert all files with a project given', async () => {
        const homedir = td.replace(os, 'homedir')
        td.when(homedir()).thenReturn('test/fixtures/')
        expect(os.homedir()).toBe('test/fixtures/')

        const spawnSync = td.replace(childProcess, 'spawnSync')
        td.when(spawnSync('xcrun')).thenReturn({
            stdout: 'xcrun installed',
            error: null
        })
        td.when(spawnSync('xcrun', td.matchers.contains('llvm-cov'), { maxBuffer: SPAWNPROCESSBUFFERSIZE })).thenReturn({
            stdout: '',
            error: null
        })

        expect(await generateSwiftCoverageFiles('Project')).toEqual([
           'Project.app.coverage.txt',
        ])
        expect(console.log).toHaveBeenCalledWith(
            expect.stringMatching(/Found 2 profdata files:/),
        )
        expect(console.log).toHaveBeenCalledWith(
            expect.stringMatching(/ {2}\+ Building reports for Project app/),
        )
        expect(console.log).not.toHaveBeenCalledWith(
            expect.stringMatching(/ {2}\+ Building reports for Project2 xctest/),
        )
    })

    it('should gracefully handle failed conversions', async () => {
        const homedir = td.replace(os, 'homedir')
        td.when(homedir()).thenReturn('test/fixtures/')
        expect(os.homedir()).toBe('test/fixtures/')

        const spawnSync = td.replace(childProcess, 'spawnSync')
        td.when(spawnSync('xcrun')).thenReturn({
            stdout: 'xcrun installed',
            error: null
        })
        td.when(spawnSync('xcrun', td.matchers.contains('llvm-cov'), { maxBuffer: SPAWNPROCESSBUFFERSIZE })).thenReturn({
            stdout: '',
            error: 'could not convert'
        })

        expect(await generateSwiftCoverageFiles('')).toEqual([])
        expect(console.log).toHaveBeenCalledWith(
            expect.stringMatching(/Found 2 profdata files:/),
        )
        expect(console.log).toHaveBeenCalledWith(
            expect.stringMatching(/ {2}\+ Building reports for Project app/),
        )
        expect(console.log).toHaveBeenCalledWith(
            expect.stringMatching(/ {2}\+ Building reports for Project2 xctest/),
        )
        expect(console.log).toHaveBeenCalledWith(
            expect.stringMatching(/ {2}Could not write coverage report to /),
        )
    })

    it('should exit gracefully if no swift coverage is found', async () => {
        const spawnSync = td.replace(childProcess, 'spawnSync')
        td.when(spawnSync('xcrun')).thenReturn({
            stdout: 'xcrun installed',
            error: null
        })
        const homedir = td.replace(os, 'homedir')
        td.when(homedir()).thenReturn('test/fixtures/yaml')
        expect(os.homedir()).toBe('test/fixtures/yaml')

        expect(await generateSwiftCoverageFiles('')).toEqual([])
        expect(console.log).toHaveBeenCalledWith(
            expect.stringMatching(/ {2}-> No swift coverage found./),
        )
    })

    it('should return an error when xcrun is not installed', async () => {
        const spawnSync = td.replace(childProcess, 'spawnSync')
        td.when(spawnSync('xcrun')).thenReturn({ error: "Command 'xcrun' not found" })

        await expect(generateSwiftCoverageFiles('')).rejects.toThrowError(/xcrun is not installed/)
    })
})
