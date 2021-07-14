const td = require('testdouble')

const providerTeamCity = require('../../src/ci_providers/provider_teamcity')

describe('TeamCity Params', () => {
  afterEach(() => {
    td.reset()
  })

  describe('detect()', () => {
    it('does not run without TeamCity env variable', () => {
      const inputs = {
        args: {},
        envs: {},
      }
      let detected = providerTeamCity.detect(inputs.envs)
      expect(detected).toBeFalsy()
    })

    it('does run with TeamCity env variable', () => {
      const inputs = {
        args: {},
        envs: {
          CI: true,
          TEAMCITY_VERSION: true,
        },
      }
      const detected = providerTeamCity.detect(inputs.envs)
      expect(detected).toBeTruthy()
    })
  })

  it('gets correct params', () => {
    const inputs = {
      args: {},
      envs: {
        CI: true,
        TEAMCITY_VERSION: true,
        BRANCH_NAME: 'main',
        BUILD_VCS_NUMBER: 'testingsha',
        BUILD_NUMBER: 1,
      },
    }
    const expected = {
      branch: 'main',
      build: 1,
      buildURL: '',
      commit: 'testingsha',
      job: '',
      pr: '',
      service: 'teamcity',
      slug: '',
    }
    const params = providerTeamCity.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  it('gets correct params for overrides', () => {
    const inputs = {
      args: {
        branch: 'branch',
        build: 3,
        pr: '2',
        sha: 'testsha',
        slug: 'testOrg/testRepo',
      },
      envs: {
        CI: true,
        TEAMCITY_VERSION: true,
        BRANCH_NAME: 'main',
        BUILD_VCS_NUMBER: 'testingsha',
        BUILD_NUMBER: 1,
      },
    }
    const expected = {
      branch: 'branch',
      build: 3,
      buildURL: '',
      commit: 'testsha',
      job: '',
      pr: '2',
      service: 'teamcity',
      slug: 'testOrg/testRepo',
    }

    const params = providerTeamCity.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })
})
