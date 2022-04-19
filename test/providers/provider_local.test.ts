import td from 'testdouble'
import childProcess from 'child_process'

import * as providerLocal from '../../src/ci_providers//provider_local'
import { SPAWNPROCESSBUFFERSIZE } from '../../src/helpers/util'
import { IServiceParams, UploaderInputs } from '../../src/types'
import { createEmptyArgs } from '../test_helpers'

describe('Local Params', () => {
  afterEach(() => {
    td.reset()
  })

  describe('detect()', () => {
    it('does not run with git not installed', () => {
      const spawnSync = td.replace(childProcess, 'spawnSync')
      td.when(spawnSync('git')).thenReturn({
        error: 'Git is not installed!',
      })
      const detected = providerLocal.detect()
      expect(detected).toBeFalsy()
    })

    it('does run with git installed', () => {
      const detected = providerLocal.detect()
      expect(detected).toBeTruthy()
    })
  })

  it('returns on override args', () => {
    const inputs: UploaderInputs = {
      args: {
        ...createEmptyArgs(),
        ...{
          branch: 'main',
          pr: '1',
          sha: 'testingsha',
          slug: 'owner/repo',
        },
      },
      environment: {},
    }
    const expected: IServiceParams = {
      branch: 'main',
      build: '',
      buildURL: '',
      commit: 'testingsha',
      job: '',
      pr: '1',
      service: '',
      slug: 'owner/repo',
    }
    const params = providerLocal.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  it('returns on override args + env vars', () => {
    const inputs: UploaderInputs = {
      args: {
        ...createEmptyArgs(),
        ...{
          pr: '1',
          slug: 'owner/repo',
        },
      },
      environment: {
        GIT_COMMIT: 'testingsha',
        GIT_BRANCH: 'main'
      },
    }
    const expected: IServiceParams = {
      branch: 'main',
      build: '',
      buildURL: '',
      commit: 'testingsha',
      job: '',
      pr: '1',
      service: '',
      slug: 'owner/repo',
    }
    const params = providerLocal.getServiceParams(inputs)
    expect(params).toMatchObject(expected)
  })

  it('returns errors on git command failures', () => {
    const inputs: UploaderInputs = {
      args: { ...createEmptyArgs() },
      environment: {},
    }
    const spawnSync = td.replace(childProcess, 'spawnSync')
    expect(() => {
      providerLocal.getServiceParams(inputs)
    }).toThrow()

    td.when(spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { maxBuffer: SPAWNPROCESSBUFFERSIZE })).thenReturn(
      {
        stdout: 'main',
      },
    )
    expect(() => {
      providerLocal.getServiceParams(inputs)
    }).toThrow()

    td.when(spawnSync('git', ['rev-parse', 'HEAD'], { maxBuffer: SPAWNPROCESSBUFFERSIZE })).thenReturn({
      stdout: 'testSHA',
    })
    expect(() => {
      providerLocal.getServiceParams(inputs)
    }).toThrow()
  })

  describe('getSlug()', () => {
    const inputs: UploaderInputs = {
      args: { ...createEmptyArgs() },
      environment: {},
    }

    it('can get the slug from a git url', () => {
      const spawnSync = td.replace(childProcess, 'spawnSync')
      td.when(
        spawnSync('git', ['config', '--get', 'remote.origin.url'], { maxBuffer: SPAWNPROCESSBUFFERSIZE }),
      ).thenReturn({
        stdout: 'git@github.com:testOrg/testRepo.git',
      })
      td.when(
        spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { maxBuffer: SPAWNPROCESSBUFFERSIZE }),
      ).thenReturn({
        stdout: 'main',
      })
      td.when(spawnSync('git', ['rev-parse', 'HEAD'], { maxBuffer: SPAWNPROCESSBUFFERSIZE })).thenReturn({
        stdout: 'testSHA',
      })
      expect(providerLocal.getServiceParams(inputs).slug).toBe(
        'testOrg/testRepo',
      )
    })

    it('can get the slug from an http(s) url', () => {
      const spawnSync = td.replace(childProcess, 'spawnSync')
      td.when(
        spawnSync('git', ['config', '--get', 'remote.origin.url'], { maxBuffer: SPAWNPROCESSBUFFERSIZE }),
      ).thenReturn({
        stdout: 'notaurl',
      })
      td.when(
        spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { maxBuffer: SPAWNPROCESSBUFFERSIZE }),
      ).thenReturn({
        stdout: 'main',
      })
      td.when(spawnSync('git', ['rev-parse', 'HEAD'], { maxBuffer: SPAWNPROCESSBUFFERSIZE })).thenReturn({
        stdout: 'testSHA',
      })
      expect(() => {
        providerLocal.getServiceParams(inputs)
      }).toThrow()
    })

    it('errors on a malformed slug', () => {
      const spawnSync = td.replace(childProcess, 'spawnSync')
      td.when(
        spawnSync('git', ['config', '--get', 'remote.origin.url'], { maxBuffer: SPAWNPROCESSBUFFERSIZE }),
      ).thenReturn({
        stdout: 'http://github.com/testOrg/testRepo.git',
      })
      td.when(
        spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { maxBuffer: SPAWNPROCESSBUFFERSIZE }),
      ).thenReturn({
        stdout: 'main',
      })
      td.when(spawnSync('git', ['rev-parse', 'HEAD'], { maxBuffer: SPAWNPROCESSBUFFERSIZE })).thenReturn({
        stdout: 'testSHA',
      })
      expect(providerLocal.getServiceParams(inputs).slug).toBe(
        'testOrg/testRepo',
      )
    })
  })
})
