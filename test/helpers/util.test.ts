import childProcess from 'child_process'
import td from 'testdouble'
import { isProgramInstalled , runExternalProgram} from '../../src/helpers/util'

describe('isProgramInstalled()', () => {
    afterEach(() => {
        td.reset()
    })

    it('should throw an error when program is not found', () => {
        const spawnSync = td.replace(childProcess, 'spawnSync')
        td.when(spawnSync('fooProg')).thenReturn({
          error: 'Huh?',
        })
        expect(isProgramInstalled('fooProg')).toBeFalsy()

    })
})

describe('runExternalProgram()', () => {
    afterEach(() => {
        td.reset()
    })

    it('should throw an error when program is not found', () => {
        const spawnSync = td.replace(childProcess, 'spawnSync')
        td.when(spawnSync('ls', ['-geewhiz'])).thenReturn({
          error: 'Huh?',
        })
        expect(() => runExternalProgram('ls', ['-geewhiz'])).toThrowError(/Huh\?/)

    })

    it('should return stdout on success', () => {
        const spawnSync = td.replace(childProcess, 'spawnSync')
        td.when(spawnSync('ls', ['-geewhiz'])).thenReturn({
          stdout: 'I am output',
        })
        expect(runExternalProgram('ls', ['-geewhiz'])).toEqual("I am output")

    })

    it('should return a trimmed string with no newlines', () => {
        const spawnSync = td.replace(childProcess, 'spawnSync')
        td.when(spawnSync('ls', ['-geewhiz'])).thenReturn({
          stdout: `
          
          
          I am output
          
          
          `,
        })
        expect(runExternalProgram('ls', ['-geewhiz'])).toEqual("I am output")

    })
})