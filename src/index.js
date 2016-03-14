'use strict'

const url = require('url')
const axios = require('axios')
const _ = require('lodash')

module.exports = class CDO {
  constructor (token) {
    this.token = token
  }
  request (resource, config) {
    return axios(resource, _.merge({
      baseURL: 'http://www.ncdc.noaa.gov/cdo-web/api/v2/',
      headers: {token: this.token}
    }, config))
      .then(res => res.data)
  }
}
