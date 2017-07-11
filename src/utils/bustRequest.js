
export default function bustRequest(url, options) {
  if (options.method && options.method !== 'GET') {
    return url
  }

  const timestamp = Math.floor(Date.now())
  return url.indexOf('?') !== -1 ?
    `${url}&_=${timestamp}` :
    `${url}?_=${timestamp}`
}
