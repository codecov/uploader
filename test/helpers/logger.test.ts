
import { logError, info, verbose, } from '../../src/helpers/logger'

describe('Logger Helper - Legacy log() tests', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('Should call logger with default options', () => {
    // eslint-disable-next-line
    jest.spyOn(console, 'log').mockImplementation(() => {})
    info('message with no options')
    expect(console.log).toHaveBeenCalledWith(
      expect.stringMatching(/no options/),
    )
  })

  it('Should not call logger with default options.level = debug and verbose not set', () => {

    // eslint-disable-next-line
    jest.spyOn(console, 'debug').mockImplementation(() => {})
    verbose('message with debug level', undefined )
    expect(console.debug).not.toHaveBeenCalled()
  })

  it('Should call logger with options.level = debug and verbose set', () => {
    jest.spyOn(console, 'debug').mockImplementation(() => {
      // Intentionally empty
    })
    verbose('message with debug level and verbose', true)
    expect(console.debug).toHaveBeenCalledWith(
      expect.stringMatching(/debug level and verbose/),
    )
  })

  it('Should call logger with options.level = error', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {
      // Intentionally empty
    })
    logError('message with error level')
    expect(console.error).toHaveBeenCalledWith(
      expect.stringMatching(/error level/),
    )
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
    logError('this is a test error')
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
