import watchLoadEntity from './watchLoadEntity.spec'
import watchCreateEntity from './watchCreateEntity.spec'

describe('sagas', () => {
  describe('watchLoadEntity', watchLoadEntity)
  describe.only('watchCreateEntity', watchCreateEntity)
})
