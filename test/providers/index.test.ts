import td from 'testdouble'

import providers from '../../src/ci_providers'
import { UploaderInputs } from '../../src/types'
import { createEmptyArgs } from '../test_helpers'

describe('CI Providers', () => {
  afterEach(() => {
    td.reset()
  })

  describe('check that each provider', () =>
    expect(providers).toBeInstanceOf(Array))
  providers.forEach(provider => {
    it(`${provider.getServiceName()} has a service name`, () => {
      expect(typeof provider.getServiceName()).toBe('string')
      expect(provider.getServiceName()).not.toBe('')
    })

    it(`${provider.getServiceName()} has env var names`, () => {
      const envVarNames = provider.getEnvVarNames()
      expect(typeof envVarNames).toBe('object')
      expect(envVarNames.length).toBeGreaterThan(0)
      for (const envVarName of envVarNames) {
        expect(typeof envVarName).toBe('string')
      }
    })

    describe(`${provider.getServiceName()} can return a ISeviceParams object that`, () => {
      const inputs: UploaderInputs = {
        args: {
          ...createEmptyArgs(),
          ...{
            sha: '123',
            slug: 'testOrg/testRepo',
          },
        },
        environment: {},
      }

      const serviceParams = provider.getServiceParams(inputs)
      expect(serviceParams).not.toBeNull()

      it('has a sha', () => {
        expect(serviceParams.commit).toEqual(inputs.args.sha)
      })

      it('has a slug', () => {
        expect(serviceParams.slug).toEqual(inputs.args.slug)
      })
    })
  })
})
