'use strict'

import axios from 'axios'
import _ from 'lodash'

export default class CDO {
  constructor (token) {
    this.token = token
  }

  datasets (params={}) { return this.request('datasets', {params}) }
  dataset (id) { return this.request(`datasets/${id}`) }

  datacategories (params={}) { return this.request('datacategories', {params}) }
  datacategory (id) { return this.request(`datacategories/${id}`) }

  request (resource, config) {
    return axios(resource, _.merge({
      baseURL: 'http://www.ncdc.noaa.gov/cdo-web/api/v2/',
      headers: {token: this.token}
    }, config))
      .then(res => res.data)
  }
}
