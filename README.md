# kraken

[![CircleCI][build-badge]][build]
[![codecov][codecov-badge]][codecov]
[![npm package][npm-badge]][npm]

The problem is always the same. You create an application and need to connect it
to your API. That means you need to think about caches, cache invalidation,
request lifecycles and more. The `kraken` helps you to focus on what is really
important: everything else but that. This library takes your types (e.g. users)
and creates everything that is needed to manage the data. All you need to care
about is from where and when to fetch.

`kraken` is built on top of [Redux](http://redux.js.org/docs/introduction/) and
[redux-saga](https://github.com/redux-saga/redux-saga) and connects to your
[React](https://facebook.github.io/react/) components.

## Installation

Install the @signavio/kraken module and its peer depedencies:

```shell
# using npm
npm install --save @signavio/kraken react redux react-redux redux-saga normalizr

# using yarn
yarn add @signavio/kraken react redux react-redux redux-saga normalizr
```

## Usage

`@signavio/kraken` provides you with the building blocks to connect React
components to your backend API. Instead of using the `kraken` directly from your
application, you are supposed to create wrapper module that defines the API
types for application based upon the functionality this library provides. The
main export of the `kraken` is a creator function that takes your custom type
definitions as an argument and returns a ready-to-use module for connecting to
your API.

### API Types

The core idea of the library is that you can split you API into different types.
Each type must export a certain set of attributes. These contain descriptions
about the structure of each type and also methods to read, create or modify an
instance of that type.

| Attribute           | Required | Description                                                                                                                                                                                 |
| ------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| schema              | `true`   | A [normalizr](https://github.com/paularmstrong/normalizr) schema that is used to store and access your data.                                                                                |
| collection          | `true`   | Identifier where all retrieved instances for that type will be stored.                                                                                                                      |
| fetch(query, body)  | `false`  | A method that takes a custom set of properties and maps it to a call of [`callAPI`](https://github.com/signavio/generic-api/blob/master/src/callApi.js) to retrieve data from your backend. |
| create(query, body) | `false`  | Function that describes how an instance is created.                                                                                                                                         |
| update(query, body) | `false`  | Function that describes how an instance is updaetd.                                                                                                                                         |
| remove(query, body) | `false`  | Function that describes how an instance is removed.                                                                                                                                         |
| cachePolicy         | `false`  | The cache policy that should be used for that type. See [cache policies](TODO) for the possible options.                                                                                    |

### `callApi(fullUrl, schema[, options])`

For every method you implement (i.e. fetch, create, update, remove) you will
need to call the `callAPI` method from `kraken` in the end. It requires the two
paramters `fullUrl` and `schema` and accepts extra options through the third
parameter `options`.

#### `fullUrl`

The URL to which the request is sent.

#### `schema`

The [normalizr](https://github.com/paularmstrong/normalizr) for the concerned
API type.

#### `options`

A set of extra parameters that are also understood by
[`fetch`](https://github.com/github/fetch#usage) (the browser fetch method).

#### Example

```es6
import { schema as schemas } from 'normalizr'

import { callApi } from '@signavio/kraken'

export const collection = 'users'
export const schema = new schemas.Entity(collection)

export const fetch = ({ id }) => callApi(`users/${id}`, schema)
export const create = (_, body) =>
  callApi('users', schema, { method: 'POST', body })
export const update = ({ id }, body) =>
  callApi(`users/${id}`, schema, { method: 'PUT', body })
export const remove = ({ id }) =>
  callApi(`users/${id}`, schema, { method: 'DELETE' })
```

In the example above we created a `user` type. It defines its collection as
`users` since it makes sense to store all fetched users together in a large user
database. Based on the `collection` we can create an
[`Entity` schema](https://github.com/paularmstrong/normalizr/blob/master/docs/api.md#entitykey-definition---options--)
that describes a user. As we only want to be able to fetch `users` for now, we
only need to define the `fetch` method. `fetch` will then map the `id` of a
`user` to an API call at `/users/{id}`.

### Exporting the pre-configured API module

After you have declared your types you can use the creator function, the default
export of the `kraken`, to initialize your pre-configured API module. The rest
of your application should never have use the `kraken` directly, but only ever
interact with the pre-configured API module. To create your custom API module
using your types, you will need some glue code similar to the following snippet:

```es6
import { mapValues } from 'lodash'

import creator, { promise, actionTypes } from '@signavio/kraken'

// These are the types you have declared
import apiTypes from './types'

const { connect, saga, reducer } = creator(apiTypes)

// create a set of keys for all the types you have declared
const types = mapValues(apiTypes, (definition, key) => key)

export { connect, types }
```

Whenever you use this library to access a resource using you API, you will need
to provide the identifying key of the respective type you want to access. As a
safeguard against nasty errors caused by typos in type references it is
advisable to export the type keys as string constants that can be imported from
any component module you want to connect to the API.

### Integrating the API module in your application

The kraken uses redux and redux-saga under the hood to manage the cache state.
To integrate it in an existing redux application you basically have to follow
two steps:

##### Apply saga middleware

Apply redux-saga's `sagaMiddleware` to your redux store and use it to run the
`saga` returned by the `creator` function.

##### Hook in cache reducer

The kraken expects to find its state under the key `kraken` in the redux store.
Use `combineReducers` to hook the `reducer` returned by the `creator` function
under the `kraken` key in your root reducer.

If your application is not using redux yet, you can hide this integration
complexity inside the pre-configured API module by additionally exporting an
`ApiProvider` component which provides the minimal setup:

```es6
import React from 'react'
import { createStore, combineReducers, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import createSagaMiddleware from 'redux-saga'

// These are the configured API building blocks returned by the kraken `creator` call
import { reducer, saga } from '../configuredApi'

// Create the saga middleware
const sagaMiddleware = createSagaMiddleware()

// Mount it on the Store
const store = createStore(
  combineReducers({ cache: reducer }),
  applyMiddleware(sagaMiddleware)
)

// Then run your pre-configured API saga
sagaMiddleware.run(saga, store.getState)

// Export a provider component wrapping the redux Provider
const ApiProvider = ({ children }) => (
  <Provider store={store}>{children}</Provider>
)

export default ApiProvider
```

### Connecting your components

Once you have finished the setup and declared your types, you can start using
your API methods in your comopnents. `connect` is a
[higher-order component creator](https://medium.com/@franleplant/react-higher-order-components-in-depth-cf9032ee6c3e),
which you can use to connect React components to your API.

```es6
import { connect, types } from 'your-api'

function User({ userFetch }) {
  if (userFetch.pending) {
    return <div>Loading user...</div>
  }

  if (userFetch.rejected) {
    return (
      <div>
        Could not fetch user:
        <br />
        {userFetch.reason}
      </div>
    )
  }

  const user = userFetch.value

  return (
    <div>
      {user.firstName} {user.lastName}
    </div>
  )
}

const enhance = connect(({ value }) => ({
  userFetch: {
    type: types.USER,
    id: value,
  },
}))

export default enhance(User)
```

As you can see using the `connect` method requires minimal setup. Also in this
case we didn't have to state that we want to `fetch` as this is the default
action. When we enhance a component using `connect` we can hook it up to as many
API resources as we want to. In this example we only used the `user` resource
and created a new prop `userFetch` that represents the API request. You include
certain configuration options to get more power over when and how requests go
out.

| Option      | Default     | Required | Description                                                                                                                                         |
| ----------- | ----------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| type        | `undefined` | `true`   | The API type which is concered.                                                                                                                     |
| query       | `undefined` | `false`  | An object of query parameters.                                                                                                                      |
| id          | `undefined` | `false`  | Shortcut to provide an ID query parameter, `id: 1` is equivalent to `query: { id: 1 }`                                                              |
| method      | `fetch`     | `false`  | Either one of `fetch`, `create`, `update`, or `remove`.                                                                                             |
| lazy        | `false`     | `false`  | Only useful in combination with `method: 'fetch'`. Per default, the resource is fetched on component mount. Set `lazy: true` to not fetch on mount. |
| denormalize | `false`     | `false`  | Inline all referenced data into the injected prop.                                                                                                  |

#### Notes on using `denormalize: true`

**In most scenarios you will not need to use this. If you choose to use it, do
so with caution.**

By default the injected value prop will be
[normalized](https://github.com/paularmstrong/normalizr/blob/master/docs/api.md#normalizedata-schema)
according to the schema you have defined for your api types. This means that
even if your server response inlines data for referenced entities, you will only
have access to the `id` property of any referenced entity. In a lot of cases
this will be absolutely fine, since different data is probably handled by
different UI components that can be connected to `kraken` respectively. However,
in some rare cases you might need to access the referenced data right away. In
these circumstances you can pass `denormalize: true`. The injected `value` will
then be
[denormalized](https://github.com/paularmstrong/normalizr/blob/master/docs/api.md#denormalizeinput-schema-entities)
and contain all nested or referenced data. If you choose to do so be advised
that the injected props will change on every render - even when your state does
not change. This is due to the fact, that `kraken` can no longer know exactly
where different parts of the state are being used. If you want to optimise for
the least number of re-renders, you need to implement `shouldComponentUpdate` on
your own in these cases.

#### Injected props

For every key returned by the function passed to `connect`, a prop with that
name will be passed down to the wrapped component. This prop will be a function
that you can call to trigger the request. While fetch requests will be triggered
automatically on component mount, the requests for all other methods will not be
dispatched until you call the injected function prop. The argument you provide
in this call will be passed as second argument to the respective type's method
implemention and is usually used as request body.

The function type props passed to your wrapped component carry additional
properties. (JavaScript allows to assign properties to functions, too.) You can
read these properties to render different stuff at different request lifecycle
states.

When connect creates such a promise-like prop it adds certain lifecycle
information that can be used to render a resource.

| Name       | Type      | Description                                                                                           |
| ---------- | --------- | ----------------------------------------------------------------------------------------------------- |
| value      | `any`     | The response value. It will only be set if `fullfilled === true`.                                     |
| pending    | `boolean` | `true` when the request is sent out but has not returned yet. `false` otherwise.                      |
| fullfilled | `boolean` | `true` when the last request returned without error. `false` otherwise.                               |
| rejected   | `boolean` | `true` when the last request returned with errors. `false` otherwise.                                 |
| reason     | `string`  | When `rejected` is true, we try to include the error message we got from the server in this property. |

## Cache Policies

`kraken` builds up a cache of your data.
When you integrate `kraken` into your app you might want to change how certain data is handled during its lifecycle.
To activate a cache policy you need to export it under the key `cachePolicy` in your api type definition file (where you also define the `schema`, etc.).

In order to do this we provide some prebuild cache policies and also allow you to create your own.

### Query from cache (`cachePolicies.queryFromCache`)

This policy is mainly used as an optimistic create.
It will enhance request results with data that is already present in the cache.
By doing so a promise prop will already have a `value` attribute even when the request didn't return yet from the server.
The objects from the cache will be filtered by using the `query` option that was set inside the `connect` call.

```es6
// type definition
import { cachePolicies } from '@signavio/kraken'

export const cachePolicy = cachePolicies.queryFromCache

// component

const AddUser = ({ createUser }) => (
  <button onClick={() => createUser({ fullName: 'John Doe' })}>
    {createUser.pending
      ? `Creating: ${createUser.value.fullName}`
      : 'Create new user'}
  </button>
)

const enhance = connect(() => ({
  createUser: {
    type: types.USER,
    method: 'create',
  },
}))

export default enhance(AddUser)
```

In the example above the type declared that the `queryFromCache` policy should be used.
Now the moment the `createUser` method is called the value will be available on the promise prop.
This way, we can already use the `value` on the promise prop to show the `fullName` of the user even though the server didn't return a response yet.

#### Caveats

In order for this mechanism to work the `query` params you specify must match attributes on the actual entities.

### Optimistic remove (`cachePolicies.optimisticRemove`)

**This policy is active by default for all [`Entity`](https://github.com/paularmstrong/normalizr/blob/master/docs/api.md#entitykey-definition---options--) types**

Using this policy you can specify that entities are removed when the remove action is dispatched.

#### Caveats

In order for this mechanism to work the `query` params you specify must match attributes on the actual entities.

### Remove references to deleted entities (`cachePolicies.removeReferencesToDeletedEntities`)

**This policy is active by default for all [`Array`](https://github.com/paularmstrong/normalizr/blob/master/docs/api.md#arraydefinition-schemaattribute) types**

If your application becomes larger then certain entities might have a relation to one another.
For instance To-Dos could have assignees.
The question then is, what happens when for instance the assignee for a certain To-Do is removed.
By default these changes will not be reflected and you need to perform the necessary updates yourself.
However, for this particular use case `kraken` also offers a cache policy you can use.
It ensures that once an entity is deleted all references to that entity will also be cleaned up in your local state.
In the To-Do example this would mean that once the assignee is deleted also the respective To-Do would no longer point to the stale `id`.

### Adding your own cache policy

There are two possiblities to influence the cache. You can either change the request state or the entity state.

```es6
export type CachePolicyT = {
  updateRequestOnCollectionChange?: (
    apiTypes: ApiTypeMap,
    request: Request,
    collection: EntityCollectionT,
    entityType: EntityType
  ) => Request,
  updateEntitiesOnAction?: (
    apiTypes: ApiTypeMap,
    entities: EntitiesState,
    action: Action
  ) => EntitiesState,
}
```

In order to influence the entity state you can export a method under the key `updateEntitiesOnAction`.
It will be called for every action that is executed by the entities reducer.
You will get access to all the api types you have declared, the current state and also get the action that was dispatched.

If you want to influence the state of a certain request when some data changes, you need to export your policy under the key `updateRequestOnCollectionChange`.
This method will be called for every request and will also be handed the entity collection which is influenced by the request.

To apply multiple cache policies at the same time you can use `cachePolicies.compose` and hand in all policies that you want to apply.

## Questions

If you have any questions please talk to one of the [authors](./AUTHORS) or
create an issue.

## Contribute

Feel free to submit PRs!

Every PR that adds new features or fixes a bug should include tests that cover
the new code. Also the code should comply to our common code style. You can use
the following commands in order to check that while you are developing.

```shell
# Install all dependencies
yarn

# Run the test suite
yarn test

# Check test coverage
yarn coverage

# Check whether you have any linting errors
yarn lint
```

[build-badge]: https://circleci.com/gh/signavio/kraken/tree/master.svg?style=shield&circle-token=:circle-token
[build]: https://circleci.com/gh/signavio/kraken/tree/master
[npm-badge]: https://img.shields.io/npm/v/@signavio/kraken.png?style=flat-square
[npm]: https://www.npmjs.org/package/@signavio/kraken
[codecov-badge]: https://codecov.io/gh/signavio/kraken/branch/master/graph/badge.svg
[codecov]: https://codecov.io/gh/signavio/kraken
