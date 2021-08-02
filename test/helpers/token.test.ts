import path from 'path'

import * as fileHelpers from '../../src/helpers/files'
import * as tokenHelpers from '../../src/helpers/token'

describe('Get tokens', () => {
  const fixturesDir = path.join(
    fileHelpers.fetchGitRoot(),
    'test/fixtures/yaml',
  )
  const invalidFixturesDir = path.join(
    fileHelpers.fetchGitRoot(),
    'test/fixtures/invalid_yaml',
  )

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('From yaml', () => {
    it('Returns empty with no yaml file', () => {
      const args = {
        flags: '',
        verbose: 'true',
      }
      expect(tokenHelpers.getTokenFromYaml('.', args)).toBe('')
    })

    it('Returns the correct token from file', () => {
      const args = {
        flags: '',
        verbose: 'true',
      }
      expect(tokenHelpers.getTokenFromYaml(fixturesDir, args)).toBe('faketoken')
    })

    it('Returns deprecation error from codecov_token', () => {
      const args = {
        flags: '',
        verbose: 'true',
      }
      jest.spyOn(console, 'error').mockImplementation(() => {
        // Intentionally empty
      })
      expect(tokenHelpers.getTokenFromYaml(invalidFixturesDir, args)).toBe('')

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("'codecov_token' is a deprecated field"),
      )
    })
  })

  describe('From right source', () => {
    it('Returns from args', () => {
      const inputs = {
        args: { token: 'argtoken', flags: '' },
        envs: { CODECOV_TOKEN: 'envtoken' },
      }
      expect(tokenHelpers.getToken(inputs, fixturesDir)).toBe('argtoken')
    })

    it('Returns from env', () => {
      const inputs = {
        args: { flags: '' },
        envs: { CODECOV_TOKEN: 'envtoken' },
      }
      expect(tokenHelpers.getToken(inputs, fixturesDir)).toBe('envtoken')
    })

    it('Returns from env', () => {
      const inputs = {
        args: { flags: '' },
        envs: {},
      }
      expect(tokenHelpers.getToken(inputs, fixturesDir)).toBe('faketoken')
    })

    it('Returns from no source', () => {
      const inputs = {
        args: { flags: '' },
        envs: {},
      }
      expect(tokenHelpers.getToken(inputs, '.')).toBe('')
    })
  })
})
