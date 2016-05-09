import 'isomorphic-fetch'
import { normalize } from "normalizr"

const API_ROOT = '/api/v1/'

// Fetches an API response and normalizes the result JSON according to schema.
// This makes every API response have the same shape, regardless of how nested it was.
export default function callApi(endpoint, schema, options) {
  const fullUrl = (endpoint.indexOf(API_ROOT) === -1) ? API_ROOT + endpoint : endpoint
  return fetch(fullUrl, options)
    .then(response => {
      if (response.headers.get('Content-Type') === 'application/json') {
        return response.json().then(json => ({ json, response }))
      }
      return response.text().then(text => ({ json: { message: text }, response }))
    }).then(({ json, response }) => {
      if (!response.ok) {
        return Promise.reject({ json, response })
      }
      return normalize(json, schema)
    })
    .then(
        response => ({ response }),
        ({ json, response }) => ({ error: json.message || response.statusText })
    )
}
