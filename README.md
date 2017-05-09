# generic-api

This module provides a means to easily create wrappers around your API.
It then provides you with a higher-order component to hook up your React components to your API.
With that in place components will re-render whenever the state of an API request changes.
This enables you to write your components in a declarative manner without caring about lifecycle management of your API requests.

## Installation

```shell
# using npm
npm install --save @signavio/generic-api

# using yarn
yarn add @signavio/generic-api
```

## Usage

`@signavio/generic-api` provides you with the building blocks to create a wrapper around your API types. 
You probably will never use components of `@signavio/generic-api` directly within your components.
More likely you are going to create your own HOCs based upon the functionality this library provides. 

### API Types

The core idea of the library is that you can split you API into different types. 
Each type must export a certain set of attributes.

| Attribute   | Required  | Description |
| ---         | ---       | --- |
| schema      | `true`    | [normalizr](https://github.com/paularmstrong/normalizr) |
| collection  | `true`    | Identifier where all retrieved instances for that type will be stored. |
| fetch       | `false`   | Function that describes how an instance is retrieved for a given ID. |
| create      | `false`   | Function that describes how an instance is created. |
| update      | `false`   | Function that describes how an instance is updaetd. |
| remove      | `false`   | Function that describes how an instance is removed. |
| cachePolicy | `false`   | The cache policy that should be used for that type. See [cache policies](TODO) for the possible options. |

#### Example

```es6
import { schema as schemas } from 'normalizr'

import { callApi } from '@signavio/generic-api'

export const collection = 'users'
export const schema = new schemas.Entity(collection)
export const fetch = ({ id }) => callApi(`users/${id}`, schema)
```

In the example above we created a `user` type. 
It defines its collection as `users` since it makes sense to store all fetched users together in a large user database. 
Based on the `collection` we can create an [`Entity` schema](https://github.com/paularmstrong/normalizr/blob/master/docs/api.md#entitykey-definition---options--) that describes a user.
As we only want to be able to fetch `users` for now, we only need to define the `fetch` method. 
`fetch` will then map the `id` of a `user` to an API call at `/users/{id}`. 

### Library Setup

After you have declared your types you can setup your connection between `@signavio/generic-api` and your code. 
For this you need to initialize the `generic-api` with your types. 

```es6
import { mapValues } from 'lodash'

import creator, { promise, actionTypes } from '@signavio/generic-api' 

// These are the types you have declared
import apiTypes from './types'

const { connect } = creator(apiTypes)

// create a set of keys for all the types you have declared
const types = mapValues(apiTypes, (definition, key) => key)

export { connect, types }
```

Whenever you use this library to access a resource using you API, you will need to provide the respective `type` you want to access. 
Therefore all you `type` declarations must be available for your components. 

### Connecting your component

Once you have finished the setup and declared your types, you can start using your API methods in your comopnents. 
The following code shows how you can fetch and display a user.

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

| Name        | Type    | Description |
| ---         | ---     | --- |
| pending     | boolean | `true` when the request is sent out but has not returned yet. `false` otherwise. |
| fullfilled  | boolean | `true` when the request returned without errors. `false` otherwise. |
| rejected    | boolean | `true` when the request returned with errors. `false` otherwise. |
| reason      | string  | When `rejected` is true, we try to include the error message we got from the server in this property. |

### Cache Policies

TODO. 

## Contribute

Feel free to submit PRs!
