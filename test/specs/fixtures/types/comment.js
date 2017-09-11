// @flow
import { schema as schemas } from 'normalizr'

import { callApi } from '../../../../src'

export const collection = 'comments'

export const schema = new schemas.Entity(collection)

export const fetch = ({ id }: { id: string }) => callApi(`/comments/${id}`)
