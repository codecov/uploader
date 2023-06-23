import childProcess from 'child_process'
import td from 'testdouble'
import { detectProvider, setSlug, walkProviders } from '../../src/helpers/provider'
import { IServiceParams, UploaderInputs } from '../../src/types'
import { createEmptyArgs } from '../test_helpers'

describe('detectProvider()', () => {
  afterEach(() => {
    td.reset()
    jest.clearAllMocks()
  })

  it('can detect a manual override', async () => {
    const inputs: UploaderInputs = {
      args: {...createEmptyArgs(), ...{
        sha: '1234566',
        slug: 'fakeOrg/fakeRepo',
      }},
      envs: {},
    }
    const expectedOutput: Partial<IServiceParams> = {
      commit: '1234566',
      slug: 'fakeOrg/fakeRepo',
    }
    expect(await detectProvider(inputs)).toMatchObject(expectedOutput)
  })

  it('can detect a manual override with token', async () => {
    const inputs: UploaderInputs = {
      args: {...createEmptyArgs(), ...{
        sha: '1234566',
      }},
      envs: {},
    }
    const expectedOutput: Partial<IServiceParams> = {
      commit: '1234566',
    }
    expect(await detectProvider(inputs, true)).toMatchObject(expectedOutput)
  })

  it('will throw if unable to detect', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => void {})
    const spawnSync = td.replace(childProcess, 'spawnSync')
    td.when(spawnSync('git')).thenReturn({
      error: 'Git is not installed!',
    })
    const inputs: UploaderInputs = {
      args: {...createEmptyArgs()},
      envs: {},
    }
    await expect(detectProvider(inputs)).rejects.toThrowError(/Unable to detect SHA and slug, please specify them manually/)
  })
})

describe('walkProviders()', () => {
  afterEach(() => {
    td.reset()
  })

  it('will throw if unable to detect', async () => {
    const spawnSync = td.replace(childProcess, 'spawnSync')
    td.when(spawnSync('git')).thenReturn({
      error: 'Git is not installed!',
    })
    const inputs: UploaderInputs = {
      args: {...createEmptyArgs()},
      envs: {},
    }
    await expect(walkProviders(inputs)).rejects.toThrow(/Unable to detect provider./)
  })

  it('will return serviceParams if able to detect', async () => {
    const inputs: UploaderInputs = {
      args: {...createEmptyArgs()},
      envs: {
        CI: 'true',
        CIRCLECI: 'true',
      },
    }
    const expectedOutput: IServiceParams = {
      branch: '',
      build: '',
      buildURL: '',
      commit: '',
      job: '',
      pr: '',
      service: 'circleci',
      slug: '',
    }
    expect(await walkProviders(inputs)).toEqual(expectedOutput)
  })
})

describe('setSlug()', () => {
  it('will return an empty string when not correctedly passed values', () => {
    expect(setSlug(undefined, undefined, undefined)).toEqual('')
    expect(setSlug(undefined, 'foo', undefined)).toEqual('')
    expect(setSlug(undefined, undefined, 'bar')).toEqual('')
  })

  it('will return the args.slug if either orgEnv or repoEnv are not valid', () => {
    expect(setSlug('baz', undefined, undefined)).toEqual('baz')
    expect(setSlug('baz', 'foo', undefined)).toEqual('baz')
    expect(setSlug('baz', undefined, 'bar')).toEqual('baz')
  })

  it('will return the args.slug if set and both orgEnv and repoEnv are valid', () => {
    expect(setSlug('baz', 'foo', 'bar')).toEqual('baz')
  })

  it('will return orgEnv/epoEnv if args.slug is empty and both orgEnv and repoEnv are valid', () => {
    expect(setSlug('', 'foo', 'bar')).toEqual('foo/bar')
  })
})
