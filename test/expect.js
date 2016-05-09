// exports preconfigured chai expect
import 'babel-polyfill'
import chai, { expect } from 'chai'
// import dirtyChai from 'dirty-chai'
import sinonChai from 'sinon-chai'
chai.use(sinonChai)

// import chaiEnzyme from 'chai-enzyme'
// chai.use(chaiEnzyme())

// chai.use(dirtyChai)

export default expect
