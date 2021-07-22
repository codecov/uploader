// @ts-check
const { error, info, verbose, log } = require('../../src/helpers/logger')
const { expect, it } = require('@jest/globals')

describe('Logger Helper - Legacy log() tests', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('Should call logger with default options', () => {
    // eslint-disable-next-line
    jest.spyOn(console, 'log').mockImplementation(() => {})
    log('message with no options')
    expect(console.log).toHaveBeenCalledWith(
      expect.stringMatching(/no options/),
    )
  })

  it('Should not call logger with default options.level = debug and verbose not set', () => {
    // eslint-disable-next-line
    jest.spyOn(console, 'debug').mockImplementation(() => {})
    log('message with debug level', { level: 'debug' })
    expect(console.debug).not.toHaveBeenCalled()
  })

  it('Should call logger with options.level = debug and verbose set', () => {
    jest.spyOn(console, 'debug').mockImplementation(() => {
      // Intentionally empty
    })
    log('message with debug level and verbose', {
      level: 'debug',
      args: { verbose: true },
    })
    expect(console.debug).toHaveBeenCalledWith(
      expect.stringMatching(/debug level and verbose/),
    )
  })

  it('Should call logger with options.level = error', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {
      // Intentionally empty
    })
    log('message with error level', { level: 'error' })
    expect(console.error).toHaveBeenCalledWith(
      expect.stringMatching(/error level/),
    )
  })

  it('Should call logger with unsupported options.level ', () => {
    jest.spyOn(console, 'log').mockImplementation(() => {
      // Intentionally empty
    })
    log('message with error level of foobar', { level: 'foobar' })
    expect(console.log).toHaveBeenCalledWith(expect.stringMatching(/of foobar/))
  })
})

describe('Logging methods', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should call console.error() when error() is called', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {
      // Intentionally empty
    })
    error('this is a test error')
    expect(console.error).toHaveBeenCalledWith(
      expect.stringMatching(/\['error'\]/),
    )
    expect(console.error).toHaveBeenCalledWith(
      expect.stringMatching(/this is a test error/),
    )
    expect(console.error).toHaveBeenCalledWith(expect.stringMatching(/Z\]/))
  })

  it('should call console.debug() when verbose() is called with shouldVerbose === true', () => {
    jest.spyOn(console, 'debug').mockImplementation(() => {
      // Intentionally empty
    })
    verbose('this is a test verbose', true)
    expect(console.debug).toHaveBeenCalledWith(
      expect.stringMatching(/\['verbose'\]/),
    )
    expect(console.debug).toHaveBeenCalledWith(
      expect.stringMatching(/this is a test verbose/),
    )
    expect(console.debug).toHaveBeenCalledWith(expect.stringMatching(/Z\]/))
  })

  it('should not call console.debug() when verbose() is called without shouldVerbose', () => {
    jest.spyOn(console, 'debug').mockImplementation(() => {
      // Intentionally empty
    })
    verbose('this is a test verbose')
    expect(console.debug).not.toBeCalled()
  })

  it('should call console.log() when info() is called ', () => {
    jest.spyOn(console, 'log').mockImplementation(() => {
      // Intentionally empty
    })
    info('this is a test info')
    expect(console.log).toHaveBeenCalledWith(
      expect.stringMatching(/\['info'\]/),
    )
    expect(console.log).toHaveBeenCalledWith(
      expect.stringMatching(/this is a test info/),
    )
    expect(console.log).toHaveBeenCalledWith(expect.stringMatching(/Z\]/))
  })
})
