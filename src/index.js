'use strict'

import axios from 'axios'
import _ from 'lodash'
import rateLimit from 'rate-limit-promise'

export default class CDO {
  constructor (token) {
    this.token = token

    this.secondLimiter = rateLimit(5, 1000)
    this.dayLimiter = rateLimit(1000, 1000*60*60*24)
  }

  datasets (params={}) { return this.request('datasets', {params}) }
  dataset (id) { return this.request(`datasets/${id}`) }

  datacategories (params={}) { return this.request('datacategories', {params}) }
  datacategory (id) { return this.request(`datacategories/${id}`) }

  request (resource, config) {
    return Promise
      .all([this.secondLimiter(), this.dayLimiter()])
      .then(() => axios(resource, _.merge({
        baseURL: 'http://www.ncdc.noaa.gov/cdo-web/api/v2/',
        headers: {token: this.token}
      }, config)))
      .then(res => res.data)
  }
}
