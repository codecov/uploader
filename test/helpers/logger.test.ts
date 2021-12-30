import { logError, info, verbose, UploadLogger } from '../../src/helpers/logger'

describe('Logging methods', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should call console.error() when error() is called', () => {
    jest.spyOn(console, 'error').mockImplementation(() => { /* Intentionally empty */ })
    logError('this is a test error')
    expect(console.error).toHaveBeenCalledWith(
      expect.stringMatching(/\['error'\]/),
    )
    expect(console.error).toHaveBeenCalledWith(
      expect.stringMatching(/this is a test error/),
    )
    expect(console.error).toHaveBeenCalledWith(expect.stringMatching(/Z\]/))
  })

  it('should not call console.debug() with default log level = info and verbose set to false', () => {
    jest.spyOn(console, 'debug').mockImplementation(() => { /* Intentionally empty */ })
    UploadLogger.setLogLevel('info')
    verbose('this is a test verbose', false)
    expect(console.debug).not.toHaveBeenCalled()
  })

  it('should call console.debug() with default log level = info and verbose set to true', () => {
    jest.spyOn(console, 'debug').mockImplementation(() => { /* Intentionally empty */ })
    UploadLogger.setLogLevel('info')
    verbose('this is a test verbose', true)
    expect(console.debug).toHaveBeenCalledWith(
      expect.stringMatching(/this is a test verbose/),
    )
  })

  it('should call console.debug() when verbose() is called and log level = verbose', () => {
    jest.spyOn(console, 'debug').mockImplementation(() => { /* Intentionally empty */ })
    UploadLogger.setLogLevel('verbose')
    UploadLogger.verbose('this is a test verbose')
    expect(console.debug).toHaveBeenCalledWith(
      expect.stringMatching(/\['verbose'\]/),
    )
    expect(console.debug).toHaveBeenCalledWith(
      expect.stringMatching(/this is a test verbose/),
    )
    expect(console.debug).toHaveBeenCalledWith(expect.stringMatching(/Z\]/))
  })

  it('should not call console.debug() when verbose() is called and log level = info', () => {
    jest.spyOn(console, 'debug').mockImplementation(() => { /* Intentionally empty */ })
    UploadLogger.setLogLevel('info')
    UploadLogger.verbose('this is a test verbose')
    expect(console.debug).not.toBeCalled()
  })

  it('should call console.log() when info() is called ', () => {
    jest.spyOn(console, 'log').mockImplementation(() => { /* Intentionally empty */ })
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
