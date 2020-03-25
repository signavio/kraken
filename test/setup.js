/* eslint-disable */
const { JSDOM } = require('jsdom')
const enzyme = require('enzyme')
const Adapter = require('enzyme-adapter-react-16')

enzyme.configure({ adapter: new Adapter() })

const exposedProperties = ['window', 'navigator', 'document']

const dom = new JSDOM(
  '<!doctype html><html><head><meta charset="utf-8"></head><body><script/></body></html>'
)
const win = dom.window

// globalize some stuff
global.document = win.document
global.window = win
win.console = global.console
global.navigator = { userAgent: 'Node.js' }
global.Blob = window.Blob
// fixes https://github.com/chaijs/type-detect/issues/98
global.HTMLElement = win.HTMLElement
global.FormData = win.FormData

global.navigator = {
  userAgent: 'node.js',
}
