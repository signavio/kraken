// @flow
import { schema as schemas } from 'normalizr'

import { type CallApi } from '../../../../src/flowTypes'
import { schema as commentSchema } from './comment'

export { collection } from './comment'

export const schema = new schemas.Array(commentSchema)

export const fetch = (callApi: CallApi) => () => callApi(`/comments`, schema)
