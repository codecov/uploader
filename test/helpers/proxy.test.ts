import { ProxyAgent } from 'undici'
import { addProxyIfNeeded, getBasicAuthToken, removeUrlAuth } from '../../src/helpers/proxy'
import { UploaderArgs } from '../../src/types'

describe('Proxy - getBasicAuthToken', () => {
    it('should make base64-encoded auth token from username and password', () => {
        const token = getBasicAuthToken('alice', 'pa$$w0rd')
        expect(token).toEqual('Basic YWxpY2U6cGEkJHcwcmQ=')
    })
})

describe('Proxy - removeUrlAuth', () => {
    it('should remove auth data from url', () => {
        const proxyUrl = 'http://alice:pa$$w0rd@proxy.local:1234/'
        expect(removeUrlAuth(proxyUrl)).toEqual('http://proxy.local:1234/')
    })
})

// copied from undici sources, as not all of them are in module exports
const kProxy = Symbol('proxy agent options')
const kProxyHeaders = Symbol('proxy headers')
const proxyAuthHeader = 'proxy-authorization'

// helper to get ProxyAgent property indexed with given Symbol
function getAgentProperty(agent: ProxyAgent, property: Symbol): any {
    const originalSymbol = Reflect.ownKeys(agent).filter((item) => item.toString() === property.toString())?.[0]
    return originalSymbol ? Reflect.get(agent, originalSymbol) : undefined
}

describe('Proxy - addProxyIfNeeded', () => {
    it.each([
        [''],
        ['invalid'],
    ])('should not return proxy if upstream argument is not set or invalid (%p)', (proxyUrl: string) => {
        const args: UploaderArgs = {
            flags: [],
            slug: '',
            upstream: proxyUrl,
        }

        const proxy = addProxyIfNeeded({}, args)
        expect(proxy).toBeUndefined()
    })

    it.each([
        ['http://proxy.local:1234/', 'http://proxy.local:1234/', undefined],
        ['http://alice:pa$$w0rd@proxy.local:1234/', 'http://proxy.local:1234/', 'Basic YWxpY2U6cGEkJHcwcmQ='],
    ])('should return proxy if upstream argument is set (%p)', (proxyUrl: string, expectedUri: string, expectedAuthHeader: any) => {
        const args: UploaderArgs = {
            flags: [],
            slug: '',
            upstream: proxyUrl,
        }

        const proxy = addProxyIfNeeded({}, args)
        expect(proxy).toBeDefined()

        const agentOptions = getAgentProperty(proxy as ProxyAgent, kProxy)
        expect(agentOptions?.['uri']).toEqual(expectedUri)

        const agentHeaders = getAgentProperty(proxy as ProxyAgent, kProxyHeaders)
        expect(agentHeaders?.[proxyAuthHeader]).toEqual(expectedAuthHeader)
    })
})
