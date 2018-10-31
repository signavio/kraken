import { spy } from 'sinon'
import { expect } from 'chai'

import { mapDispatchToPropsFactory } from '../../../../src/components/helpers'
import { actionTypes } from '../../../../src/actions'

const entityType = 'TEST_TYPE'

const types = {
  [entityType]: {},
}

const query = {
  someId: 'abcd123',
}

const refresh = {
  id: 'unique',
}

const requestParams = {
  offset: 0,
  pageSize: 25,
}

describe('helper - mapDispatchToPropsFactory', () => {
  let dispatch

  beforeEach(() => {
    dispatch = spy()
  })

  describe('remove', () => {
    let promiseProps

    const finalMapPropsToPromiseProps = () => ({
      removeType: {
        type: entityType,
        method: 'remove',
        query,
        requestParams,
      },
    })

    beforeEach(() => {
      promiseProps = mapDispatchToPropsFactory({
        types,
        finalMapPropsToPromiseProps,
      })()(dispatch, {})
    })

    it('should include the entity type in the action', () => {
      const { removeType } = promiseProps

      expect(dispatch).to.not.have.been.called

      removeType()

      expect(dispatch).to.have.been.calledOnce

      const { type, payload } = dispatch.getCall(0).args[0]

      expect(type).to.equal(actionTypes.REMOVE_DISPATCH)
      expect(payload).to.have.property('entityType', entityType)
    })

    it('should include the query in the action creator', () => {
      const { removeType } = promiseProps

      expect(dispatch).to.not.have.been.called

      removeType()

      expect(dispatch).to.have.been.calledOnce

      const { type, payload } = dispatch.getCall(0).args[0]

      expect(type).to.equal(actionTypes.REMOVE_DISPATCH)
      expect(payload).to.have.property('query', query)
    })

    it('should allow a body to be passed to the action creator', () => {
      const { removeType } = promiseProps

      expect(dispatch).to.not.have.been.called

      const body = {
        some: 'content',
      }

      removeType(body)

      expect(dispatch).to.have.been.calledOnce

      const { type, payload } = dispatch.getCall(0).args[0]

      expect(type).to.equal(actionTypes.REMOVE_DISPATCH)
      expect(payload).to.have.property('body', body)
    })

    it('should pass the request params to the action creator.', () => {
      const { removeType } = promiseProps

      expect(dispatch).to.not.have.been.called

      removeType()

      expect(dispatch).to.have.been.calledOnce

      const { type, payload } = dispatch.getCall(0).args[0]

      expect(type).to.eq(actionTypes.REMOVE_DISPATCH)
      expect(payload).to.have.property('requestParams', requestParams)
    })
  })

  describe('create', () => {
    let promiseProps

    const finalMapPropsToPromiseProps = () => ({
      createType: {
        type: entityType,
        method: 'create',
        query,
        refresh,
      },
    })

    beforeEach(() => {
      promiseProps = mapDispatchToPropsFactory({
        types,
        finalMapPropsToPromiseProps,
      })()(dispatch, {})
    })

    it('should include the query in the action creator ', () => {
      const { createType } = promiseProps

      expect(dispatch).to.not.have.been.called

      createType()

      expect(dispatch).to.have.been.calledOnce

      const { type, payload } = dispatch.getCall(0).args[0]

      expect(type).to.eq(actionTypes.CREATE_DISPATCH)
      expect(payload).to.have.property('query', query)
    })

    it('should include the refresh in the action creator', () => {
      const { createType } = promiseProps

      expect(dispatch).to.not.have.been.called

      createType()

      expect(dispatch).to.have.been.calledOnce

      const { type, payload } = dispatch.getCall(0).args[0]

      expect(type).to.eq(actionTypes.CREATE_DISPATCH)
      expect(payload).to.have.property('refresh', refresh)
    })
  })
})
