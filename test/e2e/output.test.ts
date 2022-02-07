import { promisify } from 'util'
import { execFile } from 'child_process'
import { beforeAll } from 'jest-circus'

const execFilePromise = promisify(execFile)

describe('Uploader Output E2E Tests', () => {
  let runResult: { stderr: string; stdout: string }

  describe('successful runs', () => {
    beforeEach(async () => {
      // Clear the results
      runResult = {
        stderr: '',
        stdout: '',
      }

      // Run the uploader
      runResult = await execFilePromise('node', [
        'dist/bin/codecov.js',
        '-v',
      ])

      if (runResult.stderr !== '') {
        console.error(runResult.stderr)
        expect(true).toBeFalsy // Fail
      }
    })

    it('should have starting log line', () => {
      expect(runResult.stdout).toMatch(/Start of uploader:/)
    })

    it('should have ending log line', () => {
      expect(runResult.stdout).toMatch(/End of uploader:/)
    })

  })

  describe('error runs', () => {
    beforeEach(() => {
      // Clear the results
      runResult = {
        stderr: '',
        stdout: '',
      }
    })
    it('should return an error', async () => {
      // Run the uploader
      runResult = await execFilePromise('node', [
        'dist/bin/codecov.js',
        '-v',
        '-u',
        'https://foo.local'
      ])

      if (runResult.stderr !== '') {
        console.error(runResult.stderr)
        expect(true).toBeFalsy // Fail
      }

      expect(runResult.stdout).toMatch(
        /Error uploading to https:\/\/foo.local:/,
      )

      expect(runResult.stdout).toMatch(
        /The error stack is:/,
      )
    }, 20000)
  })
})
