import childProcess from 'child_process'
import { logAndThrow } from './util'

export function parseSlug(slug: string): string {
  // origin    https://github.com/torvalds/linux.git (fetch)
  // git@github.com: codecov / uploader.git
  if (typeof slug !== 'string') {
    return ''
  }

  if (slug.match('http')) {
    // Type is http(s)
    const phaseOne = slug.split('//')[1].replace('.git', '')
    const phaseTwo = phaseOne.split('/')
    const cleanSlug = `${phaseTwo[1]}/${phaseTwo[2]}`
    return cleanSlug
  } else if (slug.match('@')) {
    // Type is git
    const cleanSlug = slug.split(':')[1].replace('.git', '')
    return cleanSlug
  }
  logAndThrow(`Unable to parse slug URL: ${slug}`)
  return ''
}

export function parseSlugFromRemoteAddr(remoteAddr: string): string {
  let slug = ''
  if (!remoteAddr) {
    remoteAddr = (
      childProcess.spawnSync('git', ['config', '--get', 'remote.origin.url'])
        .stdout || ''
    )
      .toString()
      .trimRight()
  }
  if (remoteAddr) {
    slug = parseSlug(remoteAddr)
  }
  if (slug === '/') {
    slug = ''
  }
  return slug
}
