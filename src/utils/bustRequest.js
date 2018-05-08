import { get } from 'lodash'

export default function bustRequest(url, options) {
  const method = get(options, 'method', 'GET')
  if (method !== 'GET') {
    return url
  }

  const timestamp = Math.floor(Date.now())
  return url.indexOf('?') !== -1
    ? `${url}&_=${timestamp}`
    : `${url}?_=${timestamp}`
}
