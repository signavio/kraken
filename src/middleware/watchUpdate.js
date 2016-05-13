import { takeEvery } from 'redux-saga'
import { put, call } from 'redux-saga/effects'

import { UPDATE_ENTITY } from '../actions'
import * as actions from '../actions'
import { getUpdate } from '../types'


function* updateEntity(type, body, getEntityById, getPromise) {
    const id = body[getIdAttribute(type)]
    const requestId = `update_${id}`
    const promise = getPromise(type, requestId)

    // if(promise.pending) {
    //     // TODO what do we want to do now?
    // }

    const entity = getEntityById(type, id)
    const update = getUpdate(type)
    yield put( actions.update(type, requestId, body) )

    // TODO to be cool, do an optimistic update of the entity cache and revert to 
    // previous state stored in `entity` var if the request fails

    const {response, error} = yield call(update, body)
    if(response)
        yield put( actions.success(type, requestId, response.result, response.entities) )
    else
        yield put( actions.failure(type, requestId, error) )
}

export function* watchUpdateEntity(getEntityById, getPromise) {
    yield* takeEvery(
        UPDATE_ENTITY, 
        ({ payload }) => updateEntity(
            payload.entity, payload.body,
            getEntityById, getPromise
        )
    )
}