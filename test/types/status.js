import { PropTypes } from 'react'
import { Schema } from 'normalizr'
import { callApi } from '../../src'


export const collection = 'status'

export const schema = new Schema(collection)

export const fetch = ({ id }) => callApi(`status/${id}`, schema)

export const LevelTyp = PropTypes.shape({
  count: PropTypes.number.isRequired,
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
})

export default PropTypes.shape({
  critical: LevelTyp.isRequired,
  medium: LevelTyp.isRequired,
  normal: LevelTyp.isRequired,
})
