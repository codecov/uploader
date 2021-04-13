const td = require('testdouble')
const child_process = require('child_process') // eslint-disable-line camelcase

const providers = require('../../src/ci_providers')

describe('CI Providers', () => {
  afterEach(function () {
    td.reset()
  })

  it('is an array of CI providers', () => expect(providers).toBeInstanceOf(Array))
  providers.forEach(provider => {
    const inputs = {
      args: {},
      envs: {
        CIRCLE_PROJECT_USERNAME: 'testOrg',
        CIRCLE_PROJECT_REPONAME: 'testRepo',
        CIRCLE_SHA1: 'testingSHA'
      }
    }
    describe(`${provider.getServiceName() || ''}`, () => {
      it('has a detect() method', () => {
        expect(provider.detect).toBeInstanceOf(Function)
      })
      it('has a getService() method', () => {
        expect(provider.private._getService).toBeInstanceOf(Function)
      })
      it('has a getServiceName() method', () => {
        expect(provider.getServiceName).toBeInstanceOf(Function)
      })
      it('has a getServiceParams() method', () => {
        expect(provider.getServiceParams).toBeInstanceOf(Function)
      })
      describe('getServiceParams()', () => {
        const serviceParams = provider.getServiceParams(inputs)
        it("has it's branch property set", () => {
          expect(serviceParams.branch).toBe(
            provider.private._getBranch(inputs)
          )
        })
        it("has it's build property set", () => {
          expect(serviceParams.build).toBe(
            provider.private._getBuild(inputs)
          )
        })
        it("has it's buildURL property set", () => {
          expect(serviceParams.buildURL).toBe(
            provider.private._getBuildURL(inputs)
          )
        })
        it("has it's commit property set", () => {
          expect(serviceParams.commit).toBe(
            provider.private._getSHA(inputs)
          )
        })
        it("has it's job property set", () => {
          expect(serviceParams.job).toBe(
            provider.private._getJob(inputs.envs)
          )
        })
        it("has it's pr property set", () => {
          expect(serviceParams.pr).toBe(provider.private._getPR(inputs))
        })
        it("has it's service property set", () => {
          expect(serviceParams.service).toBe(
            provider.private._getService(inputs)
          )
        })
        it("has it's slug property set", () => {
          expect(serviceParams.slug).toBe(
            provider.private._getSlug(inputs)
          )
        })
      })
      it('has a getSlug() method', () => {
        expect(provider.private._getSlug).toBeInstanceOf(Function)
      })
      describe('getSlug()', () => {
        it('can get the slug from a git url', () => {
          const spawnSync = td.replace(child_process, 'spawnSync')
          td.when(spawnSync('git', [
            'config',
            '--get',
            'remote.origin.url'])).thenReturn({
            stdout: 'git@github.com:testOrg/testRepo.git'
          })
          expect(provider.private._getSlug(inputs)).toBe(
            'testOrg/testRepo'
          )
        })
        it('can get the slug from an http(s) url', () => {
          const spawnSync = td.replace(child_process, 'spawnSync')
          td.when(spawnSync('git', [
            'config',
            '--get',
            'remote.origin.url'])).thenReturn({
            stdout: 'http://github.com/testOrg/testRepo.git'
          })
          expect(provider.private._getSlug(inputs)).toEqual(
            'testOrg/testRepo'
          )
        })
      })
    })
  })
})
