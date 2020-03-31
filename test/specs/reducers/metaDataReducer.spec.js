import createActionCreators from '../../../src/actions'
import { metaDataReducer } from '../../../src/reducers'
import expect from '../../expect'
import { apiTypes } from '../fixtures'

const actions = createActionCreators(apiTypes)

describe('metaDataReducer', () => {
  it('should be possible to set custom headers.', () => {
    const Authorization = 'my-secret'

    const action = actions.addMetaData({
      headers: {
        Authorization,
      },
    })

    const updatedState = metaDataReducer({}, action)

    expect(updatedState).to.have.property('headers')
    expect(updatedState.headers).to.have.property(
      'Authorization',
      Authorization
    )
  })

  it('should be possible to set credentials', () => {
    const credentials = 'same-origin'

    const action = actions.addMetaData({
      credentials,
    })

    const updatedState = metaDataReducer({}, action)

    expect(updatedState).to.have.property('credentials', credentials)
  })

  it('should be possible to define a base API endpoint', () => {
    const apiBase = '/my/api/v1'

    const action = actions.addMetaData({
      apiBase,
    })

    const updatedState = metaDataReducer({}, action)

    expect(updatedState).to.have.property('apiBase', apiBase)
  })
})
