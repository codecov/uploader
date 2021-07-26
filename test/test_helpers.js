const td = require('testdouble')
const childProcess = require('child_process')
const { beforeAll, afterEach, afterAll, expect } = require('@jest/globals')
const { logAndThrow } = require('../src/helpers/util')

// eslint-disable-next-line no-undef
require('testdouble-jest')(td, jest)

let execSync
let exec

beforeAll(() => {
  execSync = jest.spyOn(childProcess, 'execSync').mockImplementation(() => {
    logAndThrow(
      `Security alert! Do not use execSync(), use spawnSync() instead`,
    )
  })
  exec = jest.spyOn(childProcess, 'exec').mockImplementation(() => {
    logAndThrow(`Security alert! Do not use exec(), use spawn() instead`)
  })
})

afterEach(() => {
  expect(execSync).not.toBeCalled()
  expect(exec).not.toBeCalled()
})

afterAll(() => {
  jest.restoreAllMocks()
})
