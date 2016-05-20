import 'isomorphic-fetch'
import { normalize } from 'normalizr'

// Fetches an API response and normalizes the result JSON according to schema.
// This makes every API response have the same shape, regardless of how nested it was.
export default function callApi(fullUrl, schema, options) {
  return fetch(fullUrl, options)
    .then(response => {
      const contentType = response.headers.get('Content-Type')
      switch (contentType) {
        case 'application/json':
          return response.json().then(json => ({ json, response }))
        case 'text/plain':
          return response.text().then(text => ({ json: { message: text }, response }))
        default:
          return Promise.reject({
            json: { message: `Bad response content type: '${contentType}'` },
            response,
          })
      }
    }).then(({ json, response }) => {
      if (!response.ok) {
        return Promise.reject({ json, response })
      }
      return normalize(json, schema)
    })
    .then(
      response => ({ response }),
      ({ json, response }) => ({ error: json && json.message || response.statusText })
    )
}
