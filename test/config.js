import _ from 'lodash'

let local
try       { local = require('./local') }
catch (e) { local = {} }

export default _.merge({
  token: null, // set this to the CDO token in your email
  opts: {
    debug: true,
    config: {} // default config passed to axios
  }
}, local)
