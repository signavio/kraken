import React from 'react'

import { shallow } from 'enzyme'
import sinon from 'sinon'

import expect from '../../expect'

import creator from '../../../src'

import * as sampleData from '../../data'

import types from '../../types'

const {
  connect,
} = creator(types)


const TestComponent = (props) => (<div id="mainDiv"> { JSON.stringify(props) } </div>)


export default () => {

  it('should connect one type')
  it('should connect all types')
}
