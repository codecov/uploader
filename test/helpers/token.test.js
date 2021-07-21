const path = require('path')

const fileHelpers = require('../../src/helpers/files')
const tokenHelpers = require('../../src/helpers/token')

describe('Get tokens', () => {
  const fixturesDir = path.join(fileHelpers.fetchGitRoot(), 'test/fixtures/yaml')
  console.log(fixturesDir)
  describe('From yaml', () => {
    it('Returns empty with no yaml file', () => {
      expect(tokenHelpers.getTokenFromYaml('.')).toBe('')
    })

    it('Returns the correct token from file', () => {
      expect(tokenHelpers.getTokenFromYaml(fixturesDir)).toBe('faketoken')
    })
  })

  describe('From right source', () => {
    it('Returns from args', () => {
      const inputs = {
        args: { token: 'argtoken' },
        envs: { CODECOV_TOKEN: 'envtoken' }
      }
      expect(tokenHelpers.getToken(inputs, fixturesDir)).toBe('argtoken')
    })

    it('Returns from env', () => {
      const inputs = {
        args: {},
        envs: { CODECOV_TOKEN: 'envtoken' }
      }
      expect(tokenHelpers.getToken(inputs, fixturesDir)).toBe('envtoken')
    })

    it('Returns from env', () => {
      const inputs = {
        args: {},
        envs: {}
      }
      expect(tokenHelpers.getToken(inputs, fixturesDir)).toBe('faketoken')
    })

    it('Returns from no source', () => {
      const inputs = {
        args: {},
        envs: {}
      }
      expect(tokenHelpers.getToken(inputs, '.')).toBe('')
    })
  })
})
