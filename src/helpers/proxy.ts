import { ProxyAgent } from 'undici';
import { UploaderArgs, UploaderEnvs } from '../types';

export function addProxyIfNeeded(envs: UploaderEnvs, args: UploaderArgs): ProxyAgent | undefined {
  return args.upstream ? new ProxyAgent({ uri: args.upstream }) : undefined;
}
