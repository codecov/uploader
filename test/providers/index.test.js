const tap = require('tap')
const sinon = require('sinon')
const child_process = require('child_process')

const providers = require('../../src/ci_providers')

const stubSpawnSync = sinon.stub(child_process, 'spawnSync')

tap.test('CI Providers', t => {
  t.type(providers, 'Array', 'is an array of CI providers')

  providers.forEach(provider => {
    const inputs = {
      args: {},
      envs: {
        CIRCLE_PROJECT_USERNAME: 'testOrg',
        CIRCLE_PROJECT_REPONAME: 'testRepo',
        CIRCLE_SHA1: 'testingSHA',
      }
    }
    // t.ok(provider.detect(inputs.envs))

    t.test(`${provider.getServiceName() || ''}`, t1 => {
      t1.type(provider.detect, 'function', 'has a detect() method')
      t1.type(provider._getService, 'function', 'has a getService() method')
      t1.type(
        provider.getServiceName,
        'function',
        'has a getServiceName() method'
      )
      t1.type(
        provider.getServiceParams,
        'function',
        'has a getServiceParams() method'
      )
      t1.test('getServiceParams()', t2 => {
        stubSpawnSync
        .withArgs('git', ['config', '--get', 'remote.origin.url'])
        .returns({ stdout:'git@github.com:testOrg/testRepo.git' })

        const serviceParams = provider.getServiceParams(inputs)

        t2.same(
          serviceParams.branch,
          provider._getBranch(inputs),
          "has it's branch property set"
        )

        t2.same(
          serviceParams.build,
          provider._getBuild(inputs),
          "has it's build property set"
        )

        t2.same(
          serviceParams.buildURL,
          provider._getBuildURL(inputs),
          "has it's buildURL property set"
        )

        t2.same(
          serviceParams.commit,
          provider._getSHA(inputs),
          "has it's commit property set"
        )

        t2.same(
          serviceParams.job,
          provider._getJob(inputs),
          "has it's job property set"
        )

        t2.same(
          serviceParams.pr,
          provider._getPR(inputs),
          "has it's pr property set"
        )

        t2.same(
          serviceParams.service,
          provider._getService(inputs),
          "has it's service property set"
        )

        t2.same(
          serviceParams.slug,
          provider._getSlug(inputs),
          "has it's slug property set"
        )

        t2.done()
      })
      t1.type(provider._getSlug, 'function', 'has a getSlug() method')

      t1.test('getSlug()', t2 => {
        t2.test('can get the slug from a git url', t3 => {
          stubSpawnSync
            .withArgs('git', ['config', '--get', 'remote.origin.url'])
            .returns({ stdout:'git@github.com:testOrg/testRepo.git' })
            stubSpawnSync
            .withArgs("git", ["rev-parse", "--abbrev-ref", "HEAD"])
            .returns({ stdout:'git@github.com:testOrg/testRepo.git' })
            stubSpawnSync
            .withArgs("git", ["rev-parse", "HEAD"])
            .returns({ stdout:'git@github.com:testOrg/testRepo.git' })

          t3.same(provider._getSlug(inputs), 'testOrg/testRepo')

          t3.done()
        })

        t2.test('can get the slug from an http(s) url', t3 => {
          stubSpawnSync
            .withArgs('git', ['config', '--get', 'remote.origin.url'])
            .returns({ stdout:'http://github.com/testOrg/testRepo.git'})

          t3.same(provider._getSlug(inputs), 'testOrg/testRepo')

          t3.done()
        })
        t2.done()
      })
      t1.done()
    })
  })
  t.done()
})
