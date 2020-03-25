import 'isomorphic-fetch'

import { normalize } from 'normalizr'

import { bustRequest } from './utils'

// Fetches an API response and normalizes the result JSON according to schema.
// This makes every API response have the same shape, regardless of how nested it was.
export default async function callApi(fullUrl, schema, options = {}) {
  const url = typeof fullUrl === 'function' ? fullUrl() : fullUrl

  let body

  if (options.body instanceof FormData) {
    body = options.body
  } else if (options.body) {
    body = JSON.stringify(options.body)
  }

  const finalUrl = bustRequest(url, options)

  try {
    const response = await fetch(finalUrl, { ...options, body })

    if (response.status === 204) {
      return { response: null, error: null, status: 204 }
    }

    if (!response.ok) {
      return {
        response: null,
        error: response.statusText,
        status: response.status,
      }
    }

    const json = await processResponse(response)

    if (!json) {
      return {
        response: null,
        error: `Error: Bad response content type "${getContentType(response)}"`,
        status: response.status,
      }
    }

    return {
      response: {
        ...normalize(json, schema),
        responseHeaders: response.headers,
      },
      error: null,
      status: response.status,
    }
  } catch (e) {
    return {
      response: null,
      error: e.toString(),
    }
  }
}

function getContentType(response) {
  let contentType = response.headers.get('Content-Type')

  if (contentType !== null) {
    contentType = contentType.split(';')[0]
  }

  return contentType
}

async function processResponse(response) {
  switch (getContentType(response)) {
    case 'application/json':
      return await response.json()

    case 'text/plain':
      const message = await response.text()

      return { message }

    default:
      return null
  }
}
