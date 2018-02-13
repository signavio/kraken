// exports preconfigured chai expect
import 'babel-polyfill'
import chai, { expect } from 'chai'

import sinonChai from 'sinon-chai'
import chaiEnzyme from 'chai-enzyme'

chai.use(sinonChai)
chai.use(chaiEnzyme())

// import dirtyChai from 'dirty-chai'
// chai.use(dirtyChai)

export default expect
