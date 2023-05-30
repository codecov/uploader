import { IncomingHttpHeaders } from "undici/types/header.js"
import { addProxyHeaders } from "../src/helpers/proxy.js"
import { UploaderEnvs } from "../src/types.js"

describe('addProxyHeaders', () => {
    it('should not return an Authorization header if PROXY_BASIC_USER and PROXY_BASIC_PASS are not set', () => {
      // arrange
      const envs: UploaderEnvs = {}
      const headers: IncomingHttpHeaders = {}
  
      // act
      const headersResult = addProxyHeaders(envs, headers)
  
      // assert
      expect(headersResult['Authorization']).not.toBeDefined()
    })
  
    it('should not return an Authorization header if only PROXY_BASIC_USER is set', () => {
      // arrange
      const envs: UploaderEnvs = {
        PROXY_BASIC_USER: "testUser"
      }
      const headers: IncomingHttpHeaders = {}
  
      // act
      const headersResult = addProxyHeaders(envs, headers)
  
      // assert
      expect(headersResult['Authorization']).not.toBeDefined()
    })
  
    it('should not return an Authorization header if only PROXY_BASIC_PASS is set', () => {
      // arrange
      const envs: UploaderEnvs = {
        PROXY_BASIC_PASS: "testPass"
      }
      const headers: IncomingHttpHeaders = {}
  
      // act
      const headersResult = addProxyHeaders(envs, headers)
  
      // assert
      expect(headersResult['Authorization']).not.toBeDefined()
    })
  
    it('should return an Authorization header if both PROXY_BASIC_PASS is set', () => {
      // arrange
      const envs: UploaderEnvs = {
        PROXY_BASIC_USER: "testUser",
        PROXY_BASIC_PASS: "testPass"
      }
      const headers: IncomingHttpHeaders = {}
      const authString = `Basic ${Buffer.from(`${envs.PROXY_BASIC_USER}:${envs.PROXY_BASIC_PASS}`).toString("base64")}`
  
      // act
      const headersResult = addProxyHeaders(envs, headers)
  
      // assert
      expect(headersResult['Authorization']).toEqual(authString)
    })
  })
  