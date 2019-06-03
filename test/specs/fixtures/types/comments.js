// @flow
import { schema as schemas } from 'normalizr'

import { callApi } from '../../../../src'
import { schema as commentSchema } from './comment'

export { collection } from './comment'

export const schema = new schemas.Array(commentSchema)

export const fetch = () => callApi(`/comments`, schema)
