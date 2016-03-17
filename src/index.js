'use strict'

import axios from 'axios'
import _ from 'lodash'
import rateLimit from 'rate-limit-promise'

export default class CDO {
  constructor (token, config={}) {
    this.token = token
    this.config = _.merge({}, config)
    this.secondLimiter = rateLimit(5, 1000 + CDO.RATE_LIMIT_EPSILON_MS)
    this.dayLimiter = rateLimit(1000, 1000*60*60*24 + CDO.RATE_LIMIT_EPSILON_MS)
  }

  datasets (params={}, config={}) { return this.request('datasets', {params, ...config}) }
  dataset (id, config={}) { return this.request(`datasets/${id}`, config) }

  datacategories (params={}, config={}) { return this.request('datacategories', {params, ...config}) }
  datacategory (id, config={}) { return this.request(`datacategories/${id}`, config) }

  unpaginate (method, params, ...args) {
    if (typeof method === 'string') method = _.get(this, method)
    return method.call(this, params, ...args).then(res => {
      let {offset, count, limit} = _.get(res, 'metadata.resultset')
      let nextOffset = offset + limit
      return Promise
        .resolve(nextOffset < count
          ? this.unpaginate(method, _.merge({limit, offset: nextOffset}, params), ...args)
          : []
        )
        .then(nextRess => [res, ...nextRess])
    })
  }

  request (resource, config) {
    return Promise
      .all([this.secondLimiter(), this.dayLimiter()])
      .then(() => axios(resource, _.merge({
        baseURL: 'http://www.ncdc.noaa.gov/cdo-web/api/v2/',
        headers: {token: this.token}
      }, this.config, config)))
      .catch(res => {
        if (res.status === 429) return this.request(resource, config) // rate limited, try again
        throw res
      })
      .then(({data}) => data)
  }
}
CDO.RATE_LIMIT_EPSILON_MS = 200
