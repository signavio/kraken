// @flow
import { arrayOf } from 'normalizr'

import { callApi } from '../../../../src'

import { schema as baseSchema } from './user'

export { collection } from './user'

export const schema = arrayOf(baseSchema)

export const fetch = () => callApi('/users')
