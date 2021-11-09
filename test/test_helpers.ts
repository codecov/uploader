import { UploaderArgs } from "../src/types"

const td = require('testdouble')
const childProcess = require('child_process')
const { beforeAll, afterEach, afterAll, expect } = require('@jest/globals')

// eslint-disable-next-line no-undef
require('testdouble-jest')(td, jest)

const realLog = console.log

console.log = jest.fn()
console.debug = jest.fn()
console.error = jest.fn()

let execSync: jest.SpyInstance
let exec: jest.SpyInstance

beforeAll(() => {
  execSync = jest.spyOn(childProcess, 'execSync').mockImplementation(() => {
    throw new Error(
      `Security alert! Do not use execSync(), use spawnSync() instead`,
    )
  })
  exec = jest.spyOn(childProcess, 'exec').mockImplementation(() => {
    throw new Error(`Security alert! Do not use exec(), use spawn() instead`)
  })
})

afterEach(() => {
  expect(execSync).not.toBeCalled()
  expect(exec).not.toBeCalled()
})

afterAll(() => {
  jest.restoreAllMocks()
})

/**
 * Create a full set of uploader args for testing
 */
export function createEmptyArgs(): UploaderArgs {
  return {
    build: '',
    branch: '',
    changelog: '',
    clean: '',
    dir: '',
    dryRun: '',
    env: '',
    feature: '',
    file: '',
    flags: '',
    name: '',
    networkFilter: '',
    networkPrefix: '',
    nonZero: '',
    parent: '',
    pr: '',
    rootDir: '',
    sha: '',
    slug: '',
    source: '',
    tag: '',
    token: '',
    upstream: '',
    url: '',
    verbose: '',
  }
}
