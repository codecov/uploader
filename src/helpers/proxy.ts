import { ProxyAgent } from 'undici';
import { UploaderArgs, UploaderEnvs } from '../types';
import { IncomingHttpHeaders } from 'undici/types/header.js';

export function addProxyIfNeeded(envs: UploaderEnvs, args: UploaderArgs): ProxyAgent | undefined {
  return args.upstream ? new ProxyAgent({ uri: args.upstream }) : undefined;
}

export function addProxyHeaders(envs: UploaderEnvs, initialHeaders: IncomingHttpHeaders): IncomingHttpHeaders {
  let headers: IncomingHttpHeaders
  if (envs['PROXY_BASIC_USER'] && envs['PROXY_BASIC_PASS']) {
    const authString = Buffer.from(`${envs['PROXY_BASIC_USER']}:${envs['PROXY_BASIC_PASS']}`).toString("base64")
    headers = { ...initialHeaders, Authorization: `Basic ${authString}` }
  } else {
    headers = initialHeaders
  }
  return headers
}
