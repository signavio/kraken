// @flow
import { schema as schemas } from 'normalizr'
import { keys } from 'normalizr'

import { callApi } from '../../../../src'

import { schema as baseSchema } from './user'

export { collection } from './user'

export const schema = new schemas.Array(baseSchema)

export const fetch = () => callApi('/users')