# kraken

The problem is always the same.
You create an application and need to connect it to your API.
That means you need to think about caches, cache invalidation, request lifecycles and more.
The `kraken` helps you to focus on what is really important: everything else but that.
This library takes your types (e.g. users) and creates everything that is needed to manage the data.
All you need to care about is from where and when to fetch.

`kraken` is built on top of [Redux](http://redux.js.org/docs/introduction/) and [redux-saga](https://github.com/redux-saga/redux-saga) and connects to your [React](https://facebook.github.io/react/) components.

## Installation

Install the @signavio/kraken module and its peer depedencies:

```shell
# using npm
npm install --save @signavio/kraken react redux react-redux redux-saga normalizr

# using yarn
yarn add @signavio/kraken react redux react-redux redux-saga normalizr
```

## Usage

`@signavio/kraken` provides you with the building blocks to connect React components to your backend API. Instead of using the `kraken` directly from your application, you are supposed to create wrapper module that defines the API types for application based upon the functionality this library provides. The main export of the `kraken` is a creator function that takes your custom type definitions as an argument and returns a ready-to-use module for connecting to your API.

### API Types

The core idea of the library is that you can split you API into different types.
Each type must export a certain set of attributes.
These contain descriptions about the structure of each type and also methods to read, create or modify an instance of that type.

| Attribute   | Required  | Description |
| ---         | ---       | --- |
| schema      | `true`    | A [normalizr](https://github.com/paularmstrong/normalizr) schema that is used to store and access your data. |
| collection  | `true`    | Identifier where all retrieved instances for that type will be stored. |
| fetch       | `false`   | A method that takes a custom set of properties and maps it to a call of [`callAPI`](https://github.com/signavio/generic-api/blob/master/src/callApi.js) to retrieve data from your backend. |
| create      | `false`   | Function that describes how an instance is created. |
| update      | `false`   | Function that describes how an instance is updaetd. |
| remove      | `false`   | Function that describes how an instance is removed. |
| cachePolicy | `false`   | The cache policy that should be used for that type. See [cache policies](TODO) for the possible options. |

### `callApi(fullUrl, schema[, options])`

For every method you implement (i.e. fetch, create, update, remove) you will need to call the `callAPI` method from `kraken` in the end.
It requires the two paramters `fullUrl` and `schema` and accepts extra options through the third parameter `options`.

#### `fullUrl`
The URL to which the request is sent.

#### `schema`
The [normalizr](https://github.com/paularmstrong/normalizr) for the concerned API type.

#### `options`
A set of extra parameters that are also understood by [`fetch`](https://github.com/github/fetch#usage) (the browser fetch method).

#### Example

```es6
import { schema as schemas } from 'normalizr'

import { callApi } from '@signavio/kraken'

export const collection = 'users'
export const schema = new schemas.Entity(collection)

export const fetch = ({ id }) => (
  callApi(`users/${id}`, schema)
)
export const create = (body) => (
  callApi('users', schema, { method: 'POST', body })
)
export const update = ({ id }, body) => (
  callApi(`users/{id}`, schema, { method: 'PUT', body })
)
export const remove = ({ id }) => (
  callApi(`users/{id}`, schema, { method: 'DELETE' })
)
```

In the example above we created a `user` type.
It defines its collection as `users` since it makes sense to store all fetched users together in a large user database.
Based on the `collection` we can create an [`Entity` schema](https://github.com/paularmstrong/normalizr/blob/master/docs/api.md#entitykey-definition---options--) that describes a user.
As we only want to be able to fetch `users` for now, we only need to define the `fetch` method.
`fetch` will then map the `id` of a `user` to an API call at `/users/{id}`.

### Exporting the pre-configured API module

After you have declared your types you can use the creator function, the default export of the `kraken`, to initialize your pre-configured API module. The rest of your application should never have use the `kraken` directly, but only ever interact with the pre-configured API module. To create your custom API module using your types, you will need some glue code similar to the following snippet:

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

Whenever you use this library to access a resource using you API, you will need to provide the identifying key of the respective type you want to access. As a safeguard against nasty errors caused by typos in type references it is advisable to export the type keys as string constants that can be imported from any component module you want to connect to the API.


### Integrating the API module in your application

The kraken uses redux and redux-saga under the hood to manage the cache state. To integrate it in an existing redux application you basically have to follow two steps:

##### Apply saga middleware
Apply redux-saga's `sagaMiddleware` to your redux store and use it to run the `saga` returned by the `creator` function.

##### Hook in cache reducer
The kraken expects to find its state under the key `kraken` in the redux store. Use `combineReducers` to hook the `reducer` returned by the `creator` function under the `kraken` key in your root reducer.

If your application is not using redux yet, you can hide this integration complexity inside the pre-configured API module by additionally exporting an `ApiProvider` component which provides the minimal setup:

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
const ApiProvider = ({ children }) =>
  <Provider store={store}>
    {children}
  </Provider>

export default ApiProvider

```


### Connecting your components

Once you have finished the setup and declared your types, you can start using your API methods in your comopnents. `connect` is a [higher-order component creator](https://medium.com/@franleplant/react-higher-order-components-in-depth-cf9032ee6c3e), which you can use to connect React components to your API.

```es6
import { connect, types } from 'your-api'

function User({ userFetch }) {
  if (userFetch.pending) {
    return (
      <div>
        Loading user...
      </div>
    )
  }

  if (userFetch.rejected) {
    return (
      <div>
        Could not fetch user:
        <br />
        { userFetch.reason }
      </div>
    )
  }

  const user = userFetch.value

  return (
    <div>
      { user.firstName } { user.lastName }
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

As you can see using the `connect` method requires minimal setup.
Also in this case we didn't have to state that we want to `fetch` as this is the default action.
When we enhance a component using `connect` we can hook it up to as many API resources as we want to.
In this example we only used the `user` resource and created a new prop `userFetch` that represents the API request.
You include certain configuration options to get more power over when and how requests go out.

| Option    | Default     | Required  | Description |
| ---       | ---         | ---       | --- |
| type      | `undefined` | `true`    | The API type which is concered. |
| id        | `undefined` | `true` (fetch/update/remove)<br /> `false` (create) | Value to identify a resource. |
| method    | `fetch`     | `false`   | Either one of `fetch`, `create`, `update`, or `remove`. |
| lazy      | `false`     | `false`   | If set to true the handler must be called (e.g. `userFetch()`) in order to sent a request. |

When connect creates such a promise-like prop it adds certain lifecycle information that can be used to render a resource.

| Name        | Type      | Description |
| ---         | ---       | --- |
| pending     | `boolean` | `true` when the request is sent out but has not returned yet. `false` otherwise. |
| fullfilled  | `boolean` | `true` when the request returned without errors. `false` otherwise. |
| rejected    | `boolean` | `true` when the request returned with errors. `false` otherwise. |
| reason      | `string`  | When `rejected` is true, we try to include the error message we got from the server in this property. |

### Cache Policies

TODO.

## Questions

If you have any questions please talk to one of the [authors](./AUTHORS) or create an issue.

## Contribute

Feel free to submit PRs!

Every PR that adds new features or fixes a bug should include tests that cover the new code.
Also the code should comply to our common code style.
You can use the following commands in order to check that while you are developing.

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
