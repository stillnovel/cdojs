'use strict'

const _ = require('lodash')

let local
try       { local = require('./local') }
catch (e) { local = {} }

module.exports = _.merge({
  token: null, // set this to the CDO token in your email
  opts: {
    debug: true,
    config: {} // default config passed to axios
  }
}, local)
