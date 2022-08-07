export const TWITTER_NAMESPACE_NAME = 'twitter'

export function apiBase(dev?: boolean): string {
  return `https://${dev ? 'dev-api' : 'api'}.cardinal.so`
}
