
export default function bustRequest(url, options) {
  if (options.method && options.method !== 'GET') {
    return url
  }

  const timestamp = Math.floor(Date.now())
  if (url.indexOf('?') !== -1) {
    return `${url}&_=${timestamp}`
  }

  return `${url}?_=${timestamp}`
}
