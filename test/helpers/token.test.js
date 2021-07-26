const path = require('path')
const { expect, it } = require('@jest/globals')

const fileHelpers = require('../../src/helpers/files')
const tokenHelpers = require('../../src/helpers/token')

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
      expect(tokenHelpers.getTokenFromYaml('.')).toBe('')
    })

    it('Returns the correct token from file', () => {
      expect(
        tokenHelpers.getTokenFromYaml(fixturesDir, { verbose: true }),
      ).toBe('faketoken')
    })

    it('Returns deprecation error from codecov_token', () => {
      jest.spyOn(console, 'error').mockImplementation(() => {
        // Intentionally empty
      })
      expect(
        tokenHelpers.getTokenFromYaml(invalidFixturesDir, { verbose: true }),
      ).toBe('')

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("'codecov_token' is a deprecated field"),
      )
    })
  })

  describe('From right source', () => {
    it('Returns from args', () => {
      const inputs = {
        args: { token: 'argtoken' },
        envs: { CODECOV_TOKEN: 'envtoken' },
      }
      expect(tokenHelpers.getToken(inputs, fixturesDir)).toBe('argtoken')
    })

    it('Returns from env', () => {
      const inputs = {
        args: {},
        envs: { CODECOV_TOKEN: 'envtoken' },
      }
      expect(tokenHelpers.getToken(inputs, fixturesDir)).toBe('envtoken')
    })

    it('Returns from env', () => {
      const inputs = {
        args: {},
        envs: {},
      }
      expect(tokenHelpers.getToken(inputs, fixturesDir)).toBe('faketoken')
    })

    it('Returns from no source', () => {
      const inputs = {
        args: {},
        envs: {},
      }
      expect(tokenHelpers.getToken(inputs, '.')).toBe('')
    })
  })
})
