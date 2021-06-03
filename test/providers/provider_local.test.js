const td = require('testdouble')
const childProcess = require('child_process')

const providerLocal = require('../../src/ci_providers//provider_local')

describe('Local Params', () => {
  afterEach(function () {
    td.reset()
  })

  it('does not run with the CI env variable', () => {
    const inputs = {
      args: {},
      envs: {
        CI: true
      }
    }
    const detected = providerLocal.detect(inputs.envs)
    expect(detected).toBeFalsy()
  })

  describe('getSlug()', () => {
    const inputs = {
      args: {},
      envs: {},
    }

    it('can get the slug from a git url', () => {
      const spawnSync = td.replace(childProcess, 'spawnSync')
      td.when(spawnSync('git', [
        'config',
        '--get',
        'remote.origin.url'])).thenReturn({
        stdout: 'git@github.com:testOrg/testRepo.git'
      })
      td.when(spawnSync('git', [
        'rev-parse',
        '--abbrev-ref',
        'HEAD'])).thenReturn({
        stdout: 'main'
      })
      td.when(spawnSync('git', [
        'rev-parse',
        'HEAD'])).thenReturn({
        stdout: 'testSHA'
      })
      expect(providerLocal.getServiceParams(inputs).slug).toBe('testOrg/testRepo')
    })

    it('can get the slug from an http(s) url', () => {
      const spawnSync = td.replace(childProcess, 'spawnSync')
      td.when(spawnSync('git', [
        'config',
        '--get',
        'remote.origin.url'])).thenReturn({
        stdout: 'http://github.com/testOrg/testRepo.git'
      })
      td.when(spawnSync('git', [
        'rev-parse',
        '--abbrev-ref',
        'HEAD'])).thenReturn({
        stdout: 'main'
      })
      td.when(spawnSync('git', [
        'rev-parse',
        'HEAD'])).thenReturn({
        stdout: 'testSHA'
      })
      expect(providerLocal.getServiceParams(inputs).slug).toBe('testOrg/testRepo')
    })
  })
})
