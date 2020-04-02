// @flow

export default function bustRequest(url: string, options: ?RequestOptions) {
  const method = options?.method || 'GET'
  if (method !== 'GET') {
    return url
  }

  const timestamp = Math.floor(Date.now())
  return url.indexOf('?') !== -1
    ? `${url}&_=${timestamp}`
    : `${url}?_=${timestamp}`
}
