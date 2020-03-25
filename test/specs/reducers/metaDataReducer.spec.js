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
})
