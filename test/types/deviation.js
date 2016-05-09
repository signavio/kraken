import { PropTypes } from 'react'
import { Schema } from 'normalizr'
import { callApi } from '../../src'


export const collection = 'deviation'

export const schema = new Schema(collection)

export const fetch = ({ id }) => callApi(`deviations/${id}`, schema)

export default PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  moves: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string.isRequired,
    source: PropTypes.string.isRequired,
    target: PropTypes.string.isRequired,
  })).isRequired,
  cases: PropTypes.number.isRequired,

  fields: PropTypes.object,
})
